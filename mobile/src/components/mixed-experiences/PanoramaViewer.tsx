import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/text';
import { Typography, Spacing } from '@/constants/theme';

export interface Region {
  id: string;
  name: string;
  angle: number; // Center angle in degrees (0-360)
  width: number; // Width of the region in degrees
}

export interface Hotspot {
  id: string;
  text?: string;
  position: { x: number; y: number; z: number };
}

interface PanoramaViewerProps {
  imageUrl: any;
  title?: string;
  hotspots?: Hotspot[];
  regions?: Region[];
  onHotspotClick?: (id: string) => void;
}

// HTML template for 360 panorama viewer using Three.js
const createPanoramaHTML = (imageUrl: string, hotspots: Hotspot[] = [], regions: Region[] = []) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      overflow: hidden;
      touch-action: none;
      background: #000;
    }
    #container {
      width: 100vw;
      height: 100vh;
      position: relative;
    }
    #loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-family: Arial, sans-serif;
      z-index: 10;
    }
    #region-label {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.9);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 24px;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      pointer-events: none;
      z-index: 5;
      opacity: 0;
      transition: opacity 0.3s ease;
      background: rgba(0,0,0,0.4);
      padding: 8px 16px;
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="loading">Loading panorama...</div>
    <div id="region-label"></div>
  </div>
  <script>
    let scene, camera, renderer, sphere, controls;
    let isUserInteracting = false;
    let lon = 0, lat = 0;
    let phi = 0, theta = 0;
    let onPointerDownPointerX = 0, onPointerDownPointerY = 0;
    let onPointerDownLon = 0, onPointerDownLat = 0;
    // Target values for smooth interpolation (inertia)
    let targetLon = 0, targetLat = 0; 
    let raycaster, mouse, hotspotGroup;
    let startX = 0, startY = 0;
    let initialPinchDistance = 0;
    let initialFov = 140; // Start very wide for "Little Planet" intro effect
    
    const regions = ${JSON.stringify(regions)};
    const regionLabel = document.getElementById('region-label');

    function init() {
      const container = document.getElementById('container');
      const loading = document.getElementById('loading');

      // Scene setup
      scene = new THREE.Scene();

      // Camera setup
      camera = new THREE.PerspectiveCamera(initialFov, window.innerWidth / window.innerHeight, 1, 1100);
      camera.target = new THREE.Vector3(0, 0, 0);

      // Raycaster for hotspots
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      hotspotGroup = new THREE.Group();
      scene.add(hotspotGroup);

      // Create sphere geometry
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);

      // Load texture
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(
        '${imageUrl}',
        function(texture) {
          const material = new THREE.MeshBasicMaterial({ map: texture });
          sphere = new THREE.Mesh(geometry, material);
          scene.add(sphere);
          loading.style.display = 'none';
          createHotspots();
          
          // Intro animation: Zoom in from "Little Planet"
          let introFrame = 0;
          const targetFov = 100; // Resting FOV (wider than 85 for less "zoomed in" feel)
          const animateIntro = () => {
            if (camera.fov > targetFov) {
               camera.fov -= 1; // Zoom in speed
               camera.updateProjectionMatrix();
               requestAnimationFrame(animateIntro);
            }
          };
          animateIntro();
        },
        undefined,
        function(error) {
          loading.textContent = 'Error loading image';
          console.error('Error loading panorama:', error);
        }
      );

      // Renderer setup
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // Touch/Mouse controls
      container.addEventListener('mousedown', onPointerDown);
      container.addEventListener('touchstart', onPointerDown);
      container.addEventListener('mousemove', onPointerMove);
      container.addEventListener('touchmove', onPointerMove);
      container.addEventListener('mouseup', onPointerUp);
      container.addEventListener('touchend', onPointerUp);
      container.addEventListener('wheel', onDocumentMouseWheel);

      // Handle window resize
      window.addEventListener('resize', onWindowResize);

      animate();
    }

    function createHotspots() {
      const hotspotData = ${JSON.stringify(hotspots)};
      
      // Create a simple circular texture for the hotspot
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      
      // Outer glow/border
      context.beginPath();
      context.arc(32, 32, 30, 0, 2 * Math.PI);
      context.fillStyle = 'rgba(255, 255, 255, 0.3)';
      context.fill();
      
      // Inner circle
      context.beginPath();
      context.arc(32, 32, 20, 0, 2 * Math.PI);
      context.fillStyle = 'rgba(255, 255, 255, 0.9)';
      context.fill();
      context.lineWidth = 3;
      context.strokeStyle = '#0066CC'; 
      context.stroke();

      const texture = new THREE.CanvasTexture(canvas);

      hotspotData.forEach(data => {
        const material = new THREE.SpriteMaterial({ 
          map: texture,
          depthTest: false, // Make sure they are visible
          depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(data.position.x, data.position.y, data.position.z);
        sprite.scale.set(40, 40, 1);
        sprite.userData = { id: data.id, text: data.text };
        hotspotGroup.add(sprite);
      });
    }

    function onPointerDown(event) {
      if (event.touches) {
        if (event.touches.length === 2) {
          const dx = event.touches[0].pageX - event.touches[1].pageX;
          const dy = event.touches[0].pageY - event.touches[1].pageY;
          initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
          initialFov = camera.fov;
          isUserInteracting = false; // Disable rotation during pinch
        } else {
          onPointerDownPointerX = event.touches[0].clientX;
          onPointerDownPointerY = event.touches[0].clientY;
          isUserInteracting = true;
        }
      } else {
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        isUserInteracting = true;
      }
      
      startX = onPointerDownPointerX;
      startY = onPointerDownPointerY;

      onPointerDownLon = lon; // Use current lon/lat as base
      onPointerDownLat = lat;
      
      // Sync targets
      targetLon = lon;
      targetLat = lat;
    }

    function onPointerMove(event) {
      if (event.touches && event.touches.length === 2) {
         const dx = event.touches[0].pageX - event.touches[1].pageX;
         const dy = event.touches[0].pageY - event.touches[1].pageY;
         const distance = Math.sqrt(dx * dx + dy * dy);
         
         if (initialPinchDistance > 0) {
           const scale = initialPinchDistance / distance;
           const fov = initialFov * scale;
           camera.fov = THREE.MathUtils.clamp(fov, 10, 150); // Allow zooming out to 150 degrees
           camera.updateProjectionMatrix();
         }
         return;
      }

      if (!isUserInteracting) return;

      let clientX, clientY;
      if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      // Update target values instead of direct lon/lat
      targetLon = (onPointerDownPointerX - clientX) * 0.1 + onPointerDownLon;
      targetLat = (clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
    }

    function onPointerUp(event) {
      isUserInteracting = false;
      initialPinchDistance = 0;

      // Check for click (minimal movement)
      let clientX, clientY;
      if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const diffX = Math.abs(clientX - startX);
      const diffY = Math.abs(clientY - startY);

      // If movement is small (< 10px), treat as click/tap
      if (diffX < 10 && diffY < 10) {
        handleHotspotClick(clientX, clientY);
      }
    }

    function handleHotspotClick(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hotspotGroup.children);

      if (intersects.length > 0) {
        const hotspotId = intersects[0].object.userData.id;
        // Send message to React Native
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'hotspot', id: hotspotId }));
      }
    }

    function onDocumentMouseWheel(event) {
      const fov = camera.fov + event.deltaY * 0.05;
      camera.fov = THREE.MathUtils.clamp(fov, 10, 150);
      camera.updateProjectionMatrix();
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      update();
    }

    function update() {
      if (!isUserInteracting) {
        targetLon += 0.05; // Auto-rotate target
      }

      // Smoothly interpolate current values to target values (Damping/Inertia)
      lon += (targetLon - lon) * 0.1;
      lat += (targetLat - lat) * 0.1;

      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      // Check regions
      // Convert radians to degrees (0-360 range)
      let currentAngle = THREE.MathUtils.radToDeg(theta) % 360;
      if (currentAngle < 0) currentAngle += 360;
      
      // Adjust for Three.js coordinate system offset if needed (usually not needed if data aligned to texture)
      // currentAngle = (currentAngle + 90) % 360; 
      
      let activeRegion = null;
      for (const region of regions) {
        const angleDiff = Math.abs((currentAngle - region.angle + 540) % 360 - 180);
        if (angleDiff < region.width / 2) {
          activeRegion = region;
          break;
        }
      }
      
      if (activeRegion) {
        if (regionLabel.textContent !== activeRegion.name) {
          regionLabel.textContent = activeRegion.name;
          regionLabel.style.opacity = '1';
        }
      } else {
        regionLabel.style.opacity = '0';
        // Clear text after fade out to avoid stale text popping in
        if (regionLabel.style.opacity === '0') {
           setTimeout(() => { if(regionLabel.style.opacity === '0') regionLabel.textContent = ''; }, 300);
        }
      }

      camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
      camera.target.y = 500 * Math.cos(phi);
      camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(camera.target);
      
      // Make hotspots look at camera
      hotspotGroup.children.forEach(sprite => {
        sprite.lookAt(camera.position);
      });

      renderer.render(scene, camera);
    }

    // Initialize when page loads
    init();
  </script>
</body>
</html>
`;

export function PanoramaViewer({ imageUrl, title, hotspots = [], regions = [], onHotspotClick }: PanoramaViewerProps) {
  const { colors } = useTheme();
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadAsset = async () => {
      if (typeof imageUrl === 'number') {
        const asset = Image.resolveAssetSource(imageUrl);
        try {
          // Fetch content and convert to base64 to avoid CORS/File access issues in WebView
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setResolvedImageUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error loading local panorama asset:', error);
          // Fallback to URI if fetch fails
          setResolvedImageUrl(asset.uri);
        }
      } else {
        setResolvedImageUrl(imageUrl);
      }
    };

    loadAsset();
  }, [imageUrl]);

  const handleMessage = (event: any) => {
    if (!onHotspotClick) return;
    
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'hotspot' && data.id) {
        onHotspotClick(data.id);
      }
    } catch (error) {
      // ignore errors
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <View style={[styles.header, { backgroundColor: colors.backgroundDefault }]}>
          <Text style={[Typography.h3]}>{title}</Text>
        </View>
      )}
      {resolvedImageUrl ? (
        <WebView
          source={{ html: createPanoramaHTML(resolvedImageUrl, hotspots, regions), baseUrl: '' }}
          originWhitelist={['*']}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={handleMessage}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[Typography.body, { marginTop: Spacing.md, color: colors.textSecondary }]}>
                Loading 360° view...
              </Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[Typography.body, { marginTop: Spacing.md, color: colors.textSecondary }]}>
            Preparing panorama...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
