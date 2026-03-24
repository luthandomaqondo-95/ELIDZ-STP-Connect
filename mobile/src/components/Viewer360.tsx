import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { View, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import type { Hotspot, Scene } from '@/lib/scenes';
import { generateViewerHtml } from '@/lib/viewer-html';

let WebViewComponent: any = null;
let ViroViewer360: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WebViewComponent = require('react-native-webview').default;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ViroViewer360 = require('@/components/ViroViewer360').default;
  } catch {
    // @reactvision/react-viro not installed
  }
}

type SceneVideoSource = string | number;

async function resolveVideoUrl(source: SceneVideoSource): Promise<string> {
  if (typeof source === 'string') return source;
  const asset = Asset.fromModule(source);
  await asset.downloadAsync();
  if (Platform.OS === 'android') return asset.uri;
  return asset.localUri ?? asset.uri;
}

function getSceneVideoSource(scene: Scene): SceneVideoSource {
  return scene.videoUrl as unknown as SceneVideoSource;
}

export interface Viewer360Props {
  scene: Scene;
  onHotspotTap: (hotspot: Hotspot) => void;
  onReady: () => void;
  onLoading: () => void;
  onError: (message: string) => void;
}

export interface Viewer360Ref {
  toggleGyro: () => void;
}

type ChangeVideoMessage = {
  type: 'changeVideo';
  url: string;
  hotspots: Hotspot[];
};

function sceneSignature(scene: Scene): string {
  return `${scene.id}::${scene.videoUrl}::${JSON.stringify(scene.hotspots)}`;
}

function WebViewer({
  scene,
  onHotspotTap,
  onReady,
  onLoading,
  onError,
}: Viewer360Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const viewerReadyRef = useRef(false);
  const iframeLoadedRef = useRef(false);
  const pendingChangeRef = useRef<ChangeVideoMessage | null>(null);
  const lastSentSignatureRef = useRef<string | null>(null);
  const pendingSignatureRef = useRef<string | null>(null);

  const postToIframe = useCallback((msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), '*');
  }, []);

  const flushPending = useCallback(() => {
    const pending = pendingChangeRef.current;
    const pendingSig = pendingSignatureRef.current;
    if (!pending || !pendingSig) return;
    if (!iframeLoadedRef.current) return;
    if (!viewerReadyRef.current) return;
    if (!iframeRef.current?.contentWindow) return;
    pendingChangeRef.current = null;
    pendingSignatureRef.current = null;
    lastSentSignatureRef.current = pendingSig;
    postToIframe(pending);
  }, [postToIframe]);

  const applyChange = useCallback(
    (targetScene: Scene, url: string) => {
      const message: ChangeVideoMessage = {
        type: 'changeVideo',
        url,
        hotspots: targetScene.hotspots,
      };
      pendingChangeRef.current = message;
      pendingSignatureRef.current = sceneSignature(targetScene);
      flushPending();
    },
    [flushPending]
  );

  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    onLoading();
    viewerReadyRef.current = false;
    iframeLoadedRef.current = false;
    pendingChangeRef.current = null;
    pendingSignatureRef.current = null;
    lastSentSignatureRef.current = null;

    resolveVideoUrl(getSceneVideoSource(scene))
      .then((url) => {
        if (cancelled) return;
        const html = generateViewerHtml(url, scene.hotspots);
        const blob = new Blob([html], { type: 'text/html' });
        const url2 = URL.createObjectURL(blob);
        blobUrlRef.current = url2;
        setBlobUrl(url2);
        lastSentSignatureRef.current = sceneSignature(scene);
      })
      .catch((err) => {
        if (cancelled) return;
        onError(err instanceof Error ? err.message : 'Failed to load video');
      });

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        switch (data.type) {
          case 'hotspot_tap':
            onHotspotTap(data.hotspot);
            break;
          case 'ready':
            viewerReadyRef.current = true;
            onReady();
            flushPending();
            break;
          case 'loading':
            onLoading();
            break;
          case 'error':
            onError(data.message || 'Unknown error');
            break;
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onHotspotTap, onReady, onLoading, onError, flushPending]);

  useEffect(() => {
    let cancelled = false;
    if (!blobUrl) return;
    const sig = sceneSignature(scene);
    if (lastSentSignatureRef.current === sig) return;
    onLoading();
    resolveVideoUrl(getSceneVideoSource(scene))
      .then((url) => {
        if (cancelled) return;
        applyChange(scene, url);
      })
      .catch((err) => {
        if (!cancelled)
          onError(err instanceof Error ? err.message : 'Failed to load video');
      });
    return () => {
      cancelled = true;
    };
  }, [scene, blobUrl, applyChange, onLoading, onError]);

  if (!blobUrl) return <View className="flex-1 bg-viewer-bg" />;

  return (
    <View className="flex-1 bg-viewer-bg">
      <iframe
        ref={iframeRef}
        src={blobUrl}
        onLoad={() => {
          iframeLoadedRef.current = true;
          flushPending();
        }}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#0A0E1A',
        }}
        allow="autoplay; fullscreen"
      />
    </View>
  );
}

function NativeViewer({
  scene,
  onHotspotTap,
  onReady,
  onLoading,
  onError,
  registerGyroTrigger,
}: Viewer360Props & { registerGyroTrigger?: (fn: () => void) => void }) {
  const webViewRef = useRef<any>(null);
  const [bootHtml, setBootHtml] = useState<string>('<html><body></body></html>');
  const viewerReadyRef = useRef(false);
  const webViewLoadedRef = useRef(false);
  const pendingChangeRef = useRef<ChangeVideoMessage | null>(null);
  const lastSentSignatureRef = useRef<string | null>(null);
  const webViewAvailable = !!WebViewComponent;

  const flushPending = useCallback(() => {
    const pending = pendingChangeRef.current;
    if (!pending) return;
    if (!webViewLoadedRef.current) return;
    if (!viewerReadyRef.current) return;
    if (!webViewRef.current?.postMessage) return;
    pendingChangeRef.current = null;
    lastSentSignatureRef.current = sceneSignature({
      ...scene,
      videoUrl: pending.url,
      hotspots: pending.hotspots,
    });
    webViewRef.current.postMessage(JSON.stringify(pending));
  }, [scene]);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case 'hotspot_tap':
            onHotspotTap(data.hotspot);
            break;
          case 'ready':
            viewerReadyRef.current = true;
            onReady();
            flushPending();
            break;
          case 'loading':
            onLoading();
            break;
          case 'error':
            onError(data.message || 'Unknown error');
            break;
        }
      } catch {
        // ignore
      }
    },
    [onHotspotTap, onReady, onLoading, onError, flushPending]
  );

  useEffect(() => {
    let cancelled = false;
    if (!webViewAvailable) return;
    onLoading();
    viewerReadyRef.current = false;
    webViewLoadedRef.current = false;
    pendingChangeRef.current = null;
    lastSentSignatureRef.current = null;
    resolveVideoUrl(getSceneVideoSource(scene))
      .then((url) => {
        if (cancelled) return;
        setBootHtml(generateViewerHtml(url, scene.hotspots));
        lastSentSignatureRef.current = sceneSignature(scene);
      })
      .catch((err) => {
        if (!cancelled)
          onError(err instanceof Error ? err.message : 'Failed to load video');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!webViewAvailable) return;
    const sig = sceneSignature(scene);
    if (lastSentSignatureRef.current === sig) return;
    onLoading();
    resolveVideoUrl(getSceneVideoSource(scene))
      .then((url) => {
        if (cancelled) return;
        const message: ChangeVideoMessage = {
          type: 'changeVideo',
          url,
          hotspots: scene.hotspots,
        };

        pendingChangeRef.current = message;
        flushPending();
      })
      .catch((err) => {
        if (!cancelled)
          onError(err instanceof Error ? err.message : 'Failed to load video');
      });

    return () => {
      cancelled = true;
    };
  }, [scene, onLoading, onError, webViewAvailable, flushPending]);

  const triggerGyro = useCallback(() => {
    webViewRef.current?.injectJavaScript?.(
      "window.__toggleGyro && window.__toggleGyro(); true;"
    );
  }, []);

  useEffect(() => {
    registerGyroTrigger?.(triggerGyro);
  }, [registerGyroTrigger, triggerGyro]);

  if (!WebViewComponent) return <View className="flex-1 bg-viewer-bg" />;

  return (
    <View className="flex-1 bg-viewer-bg">
      <WebViewComponent
        ref={webViewRef}
        source={{ html: bootHtml }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        onLoadEnd={() => {
          webViewLoadedRef.current = true;
          flushPending();
        }}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsFullscreenVideo={false}
        mixedContentMode="always"
        androidLayerType="hardware"
        startInLoadingState={false}
      />
    </View>
  );
}

const Viewer360Inner = forwardRef<Viewer360Ref | null, Viewer360Props>(
  function Viewer360Inner(props, ref) {
    const toggleRef = useRef<() => void>(() => {});

    useImperativeHandle(ref, () => ({
      toggleGyro: () => toggleRef.current?.(),
    }));

    if (Platform.OS === 'web') {
      return <WebViewer {...props} />;
    }
    if (ViroViewer360) {
      return <Viewer360WithSwitch {...props} toggleRef={toggleRef} />;
    }
    return <NativeViewerWithGyroRef {...props} toggleRef={toggleRef} />;
  }
);

export default Viewer360Inner;

function NativeViewerWithGyroRef(
  props: Viewer360Props & { toggleRef: React.MutableRefObject<() => void> }
) {
  const { toggleRef, ...rest } = props;
  return (
    <NativeViewer {...rest} registerGyroTrigger={(fn) => (toggleRef.current = fn)} />
  );
}

function Viewer360WithSwitch(
  props: Viewer360Props & { toggleRef?: React.MutableRefObject<() => void> }
) {
  const { toggleRef, ...restProps } = props;
  const [useViro, setUseViro] = useState(false);
  const toggle = useCallback(() => setUseViro((v) => !v), []);
  useEffect(() => {
    if (toggleRef) toggleRef.current = toggle;
  }, [toggleRef, toggle]);

  return (
    <View className="flex-1 bg-viewer-bg">
      {useViro ? (
        <ViroViewer360 {...restProps} />
      ) : (
        <NativeViewer {...restProps} />
      )}
    </View>
  );
}
