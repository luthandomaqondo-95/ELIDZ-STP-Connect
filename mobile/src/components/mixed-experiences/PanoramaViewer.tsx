import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/text';
import { Typography, Spacing } from '@/constants/theme';

export interface Hotspot {
  id: string;
  text?: string;
  position: { x: number; y: number; z: number };
}

interface PanoramaViewerProps {
  imageUrl: string;
  title?: string;
  hotspots?: Hotspot[];
  onHotspotClick?: (id: string) => void;
}

// HTML template for 360 panorama viewer using Three.js
const createPanoramaHTML = (imageUrl: string, hotspots: Hotspot[] = []) => `
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
  </style>
</head>
<body>
  <div id="container">
    <div id="loading">Loading panorama...</div>
  </div>
  <script>
    let scene, camera, renderer, sphere, controls;
    let isUserInteracting = false;
    let lon = 0, lat = 0;
    let phi = 0, theta = 0;
    let onPointerDownPointerX = 0, onPointerDownPointerY = 0;
    let onPointerDownLon = 0, onPointerDownLat = 0;
    let raycaster, mouse, hotspotGroup;
    let startX = 0, startY = 0;

    function init() {
      const container = document.getElementById('container');
      const loading = document.getElementById('loading');

      // Scene setup
      scene = new THREE.Scene();

      // Camera setup
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
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
      loader.load(
        '${imageUrl}',
        function(texture) {
          const material = new THREE.MeshBasicMaterial({ map: texture });
          sphere = new THREE.Mesh(geometry, material);
          scene.add(sphere);
          loading.style.display = 'none';
          createHotspots();
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
        onPointerDownPointerX = event.touches[0].clientX;
        onPointerDownPointerY = event.touches[0].clientY;
      } else {
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
      }
      
      startX = onPointerDownPointerX;
      startY = onPointerDownPointerY;

      onPointerDownLon = lon;
      onPointerDownLat = lat;
      isUserInteracting = true;
    }

    function onPointerMove(event) {
      if (!isUserInteracting) return;

      let clientX, clientY;
      if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      lon = (onPointerDownPointerX - clientX) * 0.1 + onPointerDownLon;
      lat = (clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
    }

    function onPointerUp(event) {
      isUserInteracting = false;

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
      camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
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
      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

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

export function PanoramaViewer({ imageUrl, title, hotspots = [], onHotspotClick }: PanoramaViewerProps) {
  const { colors } = useTheme();

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
      <WebView
        source={{ html: createPanoramaHTML(imageUrl, hotspots) }}
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
