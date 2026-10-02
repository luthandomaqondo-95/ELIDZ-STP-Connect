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
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WebViewComponent = require('react-native-webview').default;
}

type GyroSubscription = { remove: () => void };

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function getDeviceMotion(): {
  requestPermissionsAsync?: () => Promise<{ status?: string; granted?: boolean }>;
  setUpdateInterval?: (ms: number) => void;
  addListener: (listener: (data: { rotation?: { alpha: number; beta: number; gamma: number } }) => void) => GyroSubscription;
} | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-sensors').DeviceMotion ?? null;
  } catch {
    return null;
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
  const gyroSubRef = useRef<GyroSubscription | null>(null);
  const gyroModeRef = useRef<'off' | 'pending' | 'native' | 'webview'>('off');

  const lastInjectAtRef = useRef(0);

  const injectGyroScript = useCallback((script: string) => {
    try {
      webViewRef.current?.injectJavaScript?.(script);
    } catch {
      // WebView may already be unmounted
    }
  }, []);

  const stopNativeGyro = useCallback(() => {
    try {
      gyroSubRef.current?.remove();
    } catch {
      // ignore
    }
    gyroSubRef.current = null;
  }, []);

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

  const enableWebViewGyro = useCallback(() => {
    gyroModeRef.current = 'webview';
    injectGyroScript('window.__toggleGyro && window.__toggleGyro(); true;');
  }, [injectGyroScript]);

  const triggerGyro = useCallback(() => {
    if (gyroModeRef.current === 'native') {
      stopNativeGyro();
      gyroModeRef.current = 'off';
      injectGyroScript('window.__setGyroEnabled && window.__setGyroEnabled(false); true;');
      return;
    }

    if (gyroModeRef.current === 'webview') {
      gyroModeRef.current = 'off';
      injectGyroScript('window.__toggleGyro && window.__toggleGyro(); true;');
      return;
    }

    if (gyroModeRef.current === 'pending') return;

    // DeviceMotion.addListener hard-crashes on many Android builds (native NPE).
    // Keep Android on the WebView deviceorientation path only.
    if (Platform.OS === 'android') {
      enableWebViewGyro();
      return;
    }

    gyroModeRef.current = 'pending';

    void (async () => {
      const DeviceMotion = getDeviceMotion();
      if (DeviceMotion) {
        try {
          if (typeof DeviceMotion.requestPermissionsAsync === 'function') {
            const perm = await Promise.race([
              DeviceMotion.requestPermissionsAsync(),
              new Promise<{ status?: string; granted?: boolean }>((_, reject) =>
                setTimeout(() => reject(new Error('Motion permission timed out')), 2500)
              ),
            ]);
            const granted = perm?.granted === true || perm?.status === 'granted';
            if (perm?.status && perm.status !== 'granted' && !granted) {
              throw new Error('Motion permission denied');
            }
          }
          DeviceMotion.setUpdateInterval?.(120);
          stopNativeGyro();
          lastInjectAtRef.current = 0;
          gyroSubRef.current = DeviceMotion.addListener((data) => {
            const rot = data?.rotation;
            if (!rot) return;
            const now = Date.now();
            if (now - lastInjectAtRef.current < 66) return;
            lastInjectAtRef.current = now;
            const alpha = radToDeg(rot.alpha);
            const beta = radToDeg(rot.beta);
            const gamma = radToDeg(rot.gamma);
            if (![alpha, beta, gamma].every(Number.isFinite)) return;
            injectGyroScript(
              `window.__setGyro && window.__setGyro(${alpha},${beta},${gamma}); true;`
            );
          });
          gyroModeRef.current = 'native';
          injectGyroScript('window.__setGyroEnabled && window.__setGyroEnabled(true); true;');
          return;
        } catch {
          stopNativeGyro();
        }
      }

      if (gyroModeRef.current !== 'native') {
        enableWebViewGyro();
      }
    })();
  }, [enableWebViewGyro, injectGyroScript, stopNativeGyro]);

  useEffect(() => {
    registerGyroTrigger?.(triggerGyro);
  }, [registerGyroTrigger, triggerGyro]);

  useEffect(() => {
    return () => {
      stopNativeGyro();
      gyroModeRef.current = 'off';
    };
  }, [stopNativeGyro]);

  if (!WebViewComponent) return <View className="flex-1 bg-viewer-bg" />;

  return (
    <View className="flex-1 bg-viewer-bg">
      <WebViewComponent
        ref={webViewRef}
        source={{
          html: bootHtml,
          // Android blocks deviceorientation on null/about origins from raw HTML.
          ...(Platform.OS === 'android' ? { baseUrl: 'https://localhost/' } : {}),
        }}
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
          if (gyroModeRef.current === 'native') {
            injectGyroScript('window.__setGyroEnabled && window.__setGyroEnabled(true); true;');
          }
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
