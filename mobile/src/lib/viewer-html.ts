/**
 * 360° equirectangular video viewer (HTML + Three.js) for WebView and web.
 *
 * Gyroscope / device motion (mobile):
 * - Uses the browser Device Orientation API (no extra native deps).
 * - iOS 13+: Motion permission must be requested from a user gesture (tap "Use device motion").
 * - Android: No permission; deviceorientation works when available.
 * - When gyro is on, touch-drag rotation is disabled; pinch zoom and hotspot taps still work.
 * - Camera rotation is smoothed (lerp) for natural movement.
 *
 * Performance (mobile):
 * - Pixel ratio capped (e.g. 2 on mobile) to reduce GPU load.
 * - Video texture: no mipmaps, anisotropy from renderer.
 * - Single animation loop; deviceorientation listener is passive.
 */
import type { Hotspot } from './scenes';

export function generateViewerHtml(videoUrl: string, hotspots: Hotspot[]): string {
  const hotspotsJson = JSON.stringify(hotspots);

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#0A0E1A">
<link rel="preload" href="${videoUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" as="video">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #0A0E1A; touch-action: none; }
canvas { display: block; width: 100%; height: 100%; }
#transition {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.25);
  opacity: 0;
  pointer-events: none;
  z-index: 90;
  transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1);
}
#transition.active { opacity: 1; }
#vrButton {
  position: absolute;
  right: 14px;
  bottom: 18px;
  z-index: 200;
  border: 1px solid rgba(6,182,212,0.5);
  background: rgba(10,14,26,0.75);
  color: #E2E8F0;
  padding: 10px 12px;
  border-radius: 12px;
  font-family: -apple-system, system-ui, sans-serif;
  font-size: 13px;
  letter-spacing: 0.02em;
  display: none;
}
#vrButton:active { transform: scale(0.98); }
#gyroButton {
  position: absolute;
  left: 14px;
  bottom: 76px;
  z-index: 200;
  border: 1px solid rgba(6,182,212,0.5);
  background: rgba(10,14,26,0.9);
  color: #E2E8F0;
  padding: 12px 14px;
  border-radius: 12px;
  font-family: -apple-system, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
#gyroButton.hidden { display: none; }
#gyroButton:active { transform: scale(0.98); }
#gyroBadge {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 199;
  background: rgba(6,182,212,0.2);
  color: rgba(6,182,212,0.95);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-family: -apple-system, system-ui, sans-serif;
  display: none;
}
#gyroBadge.on { display: block; }
#loading {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: rgba(10,14,26,0.0);
  z-index: 120;
  transition: opacity 1.05s cubic-bezier(0.16, 1, 0.3, 1);
}
#loading.hidden { opacity: 0; pointer-events: none; }
.spinner {
  width: 48px; height: 48px; border: 3px solid rgba(6,182,212,0.2);
  border-top-color: #06B6D4; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.load-text { color: #94A3B8; font-family: -apple-system, system-ui, sans-serif; font-size: 14px; margin-top: 16px; }
.vr-badge { color: rgba(6,182,212,0.8); font-size: 12px; margin-top: 8px; letter-spacing: 0.05em; }
</style>
</head>
<body>
<div id="loading"><div class="spinner"></div><div class="load-text">Loading 360° experience...</div><div class="vr-badge">Drag to look around</div></div>
<div id="transition"></div>
<button id="vrButton" type="button">Enter VR</button>
<button id="gyroButton" type="button" class="hidden">Use device motion</button>
<div id="gyroBadge">Motion on</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
(function() {
  var hotspots = ${hotspotsJson};
  var videoUrl = "${videoUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";

  if (typeof THREE === 'undefined') {
    var loadingEl = document.getElementById('loading');
    if (loadingEl) {
      var textEl = loadingEl.querySelector('.load-text');
      if (textEl) textEl.textContent = 'Viewer failed to load.';
    }
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Viewer failed to load' }));
    throw new Error('THREE.js not loaded');
  }

  var scene, camera, renderer, sphere, videoEl, videoTexture;
  var nextVideoEl = null, nextVideoTexture = null;
  var hotspotSprites = [];
  var lon = 0, lat = 0, phi = 0, theta = 0;
  var fov = 140;
  var roll = 0;
  var isUserInteracting = false;
  var onPointerDownX = 0, onPointerDownY = 0, onPointerDownLon = 0, onPointerDownLat = 0;
  var velocityX = 0, velocityY = 0;
  var lastMoveX = 0, lastMoveY = 0, lastMoveTime = 0;
  var pinchStartDist = 0, pinchStartFov = 140;
  var pinchStartMidX = 0, pinchStartMidY = 0;
  var pos = new THREE.Vector3(0, 0, 0);
  var maxPosRadius = 35;
  var tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  var tmpQ = new THREE.Quaternion();
  var tmpRight = new THREE.Vector3();
  var tmpUp = new THREE.Vector3();
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var sphereReady = false;
  var animating = false;
  var transitionEl = null;
  var transitioning = false;
  var restoringZoom = false;
  var transitionBaseFov = 140;
  var transitionTargetFov = 140;
  var lastTransitionAt = 0;
  var teleportInFlight = false;
  var transitionTimeoutId = 0;
  var gyroEnabled = false;
  var deviceAlpha = 0, deviceBeta = 0, deviceGamma = 0;
  var deviceOrientationAvailable = false;
  var gyroSmooth = 0.12;
  var simulatedMotion = false;
  var simStartX = 0, simStartY = 0, simStartAlpha = 0, simStartBeta = 0;
  var loadTimeoutId = null;
  var slowWarningId = null;

  window.__toggleGyro = function() {};

  function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1100);
    camera.position.set(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    var isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 2 : 2.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0A0E1A);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    transitionEl = document.getElementById('transition');
    createVideoElement();
    addEventListeners();
    setupVrButton();
    setupGyroButton();
    startAnimation();
  }

  function setupVrButton() {
    var btn = document.getElementById('vrButton');
    if (!btn) return;
    if (!navigator.xr || !navigator.xr.isSessionSupported) return;
    navigator.xr.isSessionSupported('immersive-vr').then(function(supported) {
      if (!supported) return;
      btn.style.display = 'block';
      btn.addEventListener('click', function() {
        navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
        }).then(function(session) {
          renderer.xr.setSession(session);
          btn.style.display = 'none';
        }).catch(function(err) {
          sendMessage({ type: 'error', message: 'VR session failed: ' + (err && err.message ? err.message : String(err)) });
        });
      });
    }).catch(function() {});
  }

  function setupGyroButton() {
    var btn = document.getElementById('gyroButton');
    var badge = document.getElementById('gyroBadge');
    if (!btn) return;
    var isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!window.ReactNativeWebView) {
      btn.classList.remove('hidden');
    }
    btn.textContent = 'Enable gyroscope';
    function updateGyroButtonLabel() {
      btn.textContent = gyroEnabled ? 'Gyroscope on' : 'Enable gyroscope';
      if (badge) {
        if (gyroEnabled) { badge.classList.add('on'); badge.textContent = 'Motion on'; } else { badge.classList.remove('on'); }
      }
      if (window.ReactNativeWebView) sendMessage({ type: 'gyro_state', enabled: gyroEnabled });
    }
    btn.addEventListener('click', function requestGyro(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      if (gyroEnabled) {
        gyroEnabled = false;
        if (simulatedMotion) simulatedMotion = false;
        deviceOrientationAvailable = false;
        updateGyroButtonLabel();
        return;
      }
      if (!isMobile) {
        simulatedMotion = true;
        gyroEnabled = true;
        deviceOrientationAvailable = true;
        deviceAlpha = lon;
        deviceBeta = -lat;
        deviceGamma = roll;
        updateGyroButtonLabel();
        return;
      }
      var DeviceOrientationEvent = window.DeviceOrientationEvent;
      if (DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(function(perm) {
            if (perm === 'granted') {
              startDeviceOrientation();
              gyroEnabled = true;
              updateGyroButtonLabel();
            } else {
              sendMessage({ type: 'error', message: 'Motion permission denied. If you use Expo Go, try a development build (npx expo run:ios) so the permission dialog can appear.' });
            }
          })
          .catch(function(err) {
            var msg = err && err.message ? err.message : String(err);
            if (msg.indexOf('denied') !== -1 || msg.indexOf('NotAllowed') !== -1) {
              msg = 'Motion access denied. Rebuild the app (not Expo Go) and tap again, or allow Motion in Settings > Privacy.';
            }
            sendMessage({ type: 'error', message: 'Motion permission failed: ' + msg });
          });
      } else {
        startDeviceOrientation();
        gyroEnabled = true;
        updateGyroButtonLabel();
      }
    });
    window.__toggleGyro = function() {
      if (btn) btn.click();
    };
    if (window.ReactNativeWebView) sendMessage({ type: 'gyro_state', enabled: false });
  }

  function startDeviceOrientation() {
    deviceOrientationAvailable = true;
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
  }

  function onDeviceOrientation(e) {
    if (e.alpha != null) deviceAlpha = e.alpha;
    if (e.beta != null) deviceBeta = e.beta;
    if (e.gamma != null) deviceGamma = e.gamma;
  }

  function configureVideoElement(el, src) {
    if (/^https?:/i.test(src)) el.crossOrigin = 'anonymous';
    else el.removeAttribute('crossorigin');
    el.playsInline = true;
    el.loop = true;
    el.muted = true;
    el.preload = 'auto';
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');
    el.src = src;
  }

  function createVideoElement() {
    videoEl = document.createElement('video');
    configureVideoElement(videoEl, videoUrl);

    videoEl.addEventListener('loadeddata', onVideoReady);
    videoEl.addEventListener('canplay', onVideoReady);
    videoEl.addEventListener('error', function() {
      var err = videoEl.error;
      var detail = err ? ('code ' + err.code + (err.message ? (': ' + err.message) : '')) : 'unknown';
      console.error('Video error:', detail, 'src=', videoEl.src);
      if (!sphereReady) {
        createFallbackSphere();
        sendMessage({ type: 'error', message: 'Video failed to load (' + detail + ')' });
      }
    });

    videoEl.load();

    var isMobileDevice = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    var loadTimeoutMs = isMobileDevice ? 40000 : 25000;
    var slowWarningMs = 10000;
    var slowWarningShown = false;
    slowWarningId = setTimeout(function() {
      slowWarningId = null;
      if (!sphereReady && !slowWarningShown) {
        slowWarningShown = true;
        var loadingText = document.querySelector('#loading .load-text');
        if (loadingText) loadingText.textContent = 'Still loading… (slow connection or device)';
      }
    }, slowWarningMs);
    loadTimeoutId = setTimeout(function() {
      loadTimeoutId = null;
      if (!sphereReady) {
        createFallbackSphere();
        var loadingText = document.querySelector('#loading .load-text');
        if (loadingText) loadingText.textContent = 'Showing placeholder (video slow or unreachable)';
        sendMessage({ type: 'error', message: 'Video took too long to load (src=' + videoEl.src + ')' });
      }
    }, loadTimeoutMs);
  }

  var videoReadyCalled = false;
  function onVideoReady() {
    if (videoReadyCalled) return;
    if (videoEl.readyState < 2) return;
    videoReadyCalled = true;
    if (loadTimeoutId != null) { clearTimeout(loadTimeoutId); loadTimeoutId = null; }
    if (slowWarningId != null) { clearTimeout(slowWarningId); slowWarningId = null; }
    videoEl.play().then(function() {
      createVideoSphere();
      createHotspots();
      hideLoading();
      endTransition();
      sendMessage({ type: 'ready' });
      if (window.ReactNativeWebView) sendMessage({ type: 'gyro_state', enabled: false });
    }).catch(function() {
      createVideoSphere();
      createHotspots();
      hideLoading();
      endTransition();
      sendMessage({ type: 'ready' });
      if (window.ReactNativeWebView) sendMessage({ type: 'gyro_state', enabled: false });
    });
  }

  function hideLoading() {
    var el = document.getElementById('loading');
    if (el) el.classList.add('hidden');
  }

  function startTransition() {
    var now = Date.now();
    if (now - lastTransitionAt < 200) return;
    lastTransitionAt = now;
    if (transitionEl) transitionEl.classList.add('active');
    transitioning = true;
    restoringZoom = false;
    transitionBaseFov = fov;
    transitionTargetFov = Math.max(60, Math.min(140, transitionBaseFov * 0.78));
    teleportInFlight = true;
    if (transitionTimeoutId) clearTimeout(transitionTimeoutId);
    transitionTimeoutId = setTimeout(function() {
      teleportInFlight = false;
      endTransition();
      hideLoading();
    }, 15000);
  }

  function endTransition() {
    if (transitionEl) transitionEl.classList.remove('active');
    transitioning = false;
    restoringZoom = true;
    transitionTargetFov = transitionBaseFov;
    teleportInFlight = false;
    if (transitionTimeoutId) clearTimeout(transitionTimeoutId);
    transitionTimeoutId = 0;
  }

  function createFallbackSphere() {
    if (sphereReady) return;
    sphereReady = true;
    var canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, 2048, 1024);
    grad.addColorStop(0, '#0c1445');
    grad.addColorStop(0.5, '#0d47a1');
    grad.addColorStop(1, '#0c1445');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);
    var texture = new THREE.CanvasTexture(canvas);
    var geo = new THREE.SphereGeometry(500, 60, 40);
    geo.scale(-1, 1, 1);
    var poleCrop = 0.02;
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        poleCrop: { value: poleCrop }
      },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\\n'),
      fragmentShader: [
        'uniform sampler2D map;',
        'uniform float poleCrop;',
        'varying vec2 vUv;',
        'void main() {',
        '  vec2 uv = vUv;',
        '  uv.x = fract(uv.x);',
        '  uv.y = clamp(uv.y, poleCrop, 1.0 - poleCrop);',
        '  gl_FragColor = texture2D(map, uv);',
        '}'
      ].join('\\n')
    });
    sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);
    createHotspots();
    hideLoading();
    endTransition();
    sendMessage({ type: 'ready' });
  }

  function ensureSphereWithTexture(texture) {
    if (sphere && sphere.material && sphere.material.uniforms && sphere.material.uniforms.map) {
      sphere.material.uniforms.map.value = texture;
      sphere.material.needsUpdate = true;
      return;
    }
    var geo = new THREE.SphereGeometry(500, 60, 40);
    geo.scale(-1, 1, 1);
    var poleCrop = 0.02;
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        poleCrop: { value: poleCrop }
      },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\\n'),
      fragmentShader: [
        'uniform sampler2D map;',
        'uniform float poleCrop;',
        'varying vec2 vUv;',
        'void main() {',
        '  vec2 uv = vUv;',
        '  uv.x = fract(uv.x);',
        '  uv.y = clamp(uv.y, poleCrop, 1.0 - poleCrop);',
        '  gl_FragColor = texture2D(map, uv);',
        '}'
      ].join('\\n')
    });
    sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);
  }

  function createVideoSphere() {
    if (sphere) {
      sphere.material.dispose();
      sphere.geometry.dispose();
      scene.remove(sphere);
      sphere = null;
    }
    sphereReady = true;

    videoTexture = new THREE.VideoTexture(videoEl);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    videoTexture.generateMipmaps = false;
    videoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    ensureSphereWithTexture(videoTexture);
  }

  function createHotspotSprite(hotspot) {
    var canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    var ctx = canvas.getContext('2d');
    var isNav = hotspot.type === 'navigation';
    ctx.beginPath();
    ctx.arc(64, 64, 48, 0, Math.PI * 2);
    ctx.fillStyle = isNav ? 'rgba(6,182,212,0.9)' : 'rgba(139,92,246,0.9)';
    ctx.fill();
    ctx.strokeStyle = isNav ? 'rgba(34,211,238,0.5)' : 'rgba(167,139,250,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isNav) {
      ctx.beginPath();
      ctx.moveTo(52, 48);
      ctx.lineTo(80, 64);
      ctx.lineTo(52, 80);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillText('i', 64, 66);
    }
    var texture = new THREE.CanvasTexture(canvas);
    var mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false });
    var sprite = new THREE.Sprite(mat);
    var yawRad = THREE.MathUtils.degToRad(hotspot.yaw);
    var pitchRad = THREE.MathUtils.degToRad(hotspot.pitch);
    var radius = 450;
    sprite.position.set(
      radius * Math.cos(pitchRad) * Math.sin(yawRad),
      radius * Math.sin(pitchRad),
      radius * Math.cos(pitchRad) * Math.cos(yawRad)
    );
    sprite.scale.set(40, 40, 1);
    sprite.userData = { hotspot: hotspot };
    return sprite;
  }

  function createHotspots() {
    hotspotSprites.forEach(function(s) {
      s.material.map.dispose();
      s.material.dispose();
      scene.remove(s);
    });
    hotspotSprites = [];
    hotspots.forEach(function(h) {
      var sprite = createHotspotSprite(h);
      scene.add(sprite);
      hotspotSprites.push(sprite);
    });
  }

  function addEventListeners() {
    var el = renderer.domElement;
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
  }

  var touchStartTime = 0, touchStartPos = { x: 0, y: 0 }, isTap = false;

  function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      isUserInteracting = true;
      onPointerDownX = e.touches[0].clientX;
      onPointerDownY = e.touches[0].clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
      if (simulatedMotion) {
        simStartX = e.touches[0].clientX;
        simStartY = e.touches[0].clientY;
        simStartAlpha = deviceAlpha;
        simStartBeta = deviceBeta;
      }
      velocityX = 0;
      velocityY = 0;
      lastMoveX = e.touches[0].clientX;
      lastMoveY = e.touches[0].clientY;
      lastMoveTime = Date.now();
      touchStartTime = Date.now();
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isTap = true;
    } else if (e.touches.length === 2) {
      isUserInteracting = false;
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist = Math.sqrt(dx * dx + dy * dy);
      pinchStartFov = fov;
      pinchStartMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      pinchStartMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && isUserInteracting && gyroEnabled && simulatedMotion) {
      deviceAlpha = simStartAlpha + (e.touches[0].clientX - simStartX) * -0.15;
      deviceBeta = Math.max(-85, Math.min(85, simStartBeta + (e.touches[0].clientY - simStartY) * 0.15));
      var dist = Math.sqrt(Math.pow(e.touches[0].clientX - touchStartPos.x, 2) + Math.pow(e.touches[0].clientY - touchStartPos.y, 2));
      if (dist > 10) isTap = false;
    } else if (e.touches.length === 1 && isUserInteracting) {
      var now = Date.now();
      var dt = Math.max(1, now - lastMoveTime);
      lon = (e.touches[0].clientX - onPointerDownX) * -0.15 + onPointerDownLon;
      lat = (e.touches[0].clientY - onPointerDownY) * 0.15 + onPointerDownLat;
      velocityX = (e.touches[0].clientX - lastMoveX) / dt * -8;
      velocityY = (e.touches[0].clientY - lastMoveY) / dt * 8;
      lastMoveX = e.touches[0].clientX;
      lastMoveY = e.touches[0].clientY;
      lastMoveTime = now;
      var dist = Math.sqrt(Math.pow(e.touches[0].clientX - touchStartPos.x, 2) + Math.pow(e.touches[0].clientY - touchStartPos.y, 2));
      if (dist > 10) isTap = false;
    } else if (e.touches.length === 2) {
      isTap = false;
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var scale = pinchStartDist / dist;
      fov = Math.max(60, Math.min(140, pinchStartFov * scale));
      camera.fov = fov;
      camera.updateProjectionMatrix();

      var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      var mdx = midX - pinchStartMidX;
      var mdy = midY - pinchStartMidY;
      pinchStartMidX = midX;
      pinchStartMidY = midY;

      var yawR = THREE.MathUtils.degToRad(lon);
      var pitchR = THREE.MathUtils.degToRad(lat);
      var rollR = THREE.MathUtils.degToRad(roll);
      tmpEuler.set(pitchR, yawR, rollR, 'YXZ');
      tmpQ.setFromEuler(tmpEuler);
      tmpRight.set(1, 0, 0).applyQuaternion(tmpQ);
      tmpUp.set(0, 1, 0).applyQuaternion(tmpQ);
      pos.addScaledVector(tmpRight, -mdx * 0.05);
      pos.addScaledVector(tmpUp, mdy * 0.05);
      if (pos.length() > maxPosRadius) pos.setLength(maxPosRadius);
    }
  }

  function onTouchEnd(e) {
    isUserInteracting = false;
    if (isTap && Date.now() - touchStartTime < 300) checkHotspotTap(touchStartPos.x, touchStartPos.y);
  }

  function onMouseDown(e) {
    isUserInteracting = true;
    onPointerDownX = e.clientX;
    onPointerDownY = e.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    if (simulatedMotion) {
      simStartX = e.clientX;
      simStartY = e.clientY;
      simStartAlpha = deviceAlpha;
      simStartBeta = deviceBeta;
    }
    velocityX = 0;
    velocityY = 0;
    lastMoveX = e.clientX;
    lastMoveY = e.clientY;
    lastMoveTime = Date.now();
    touchStartTime = Date.now();
    touchStartPos = { x: e.clientX, y: e.clientY };
    isTap = true;
  }

  function onMouseMove(e) {
    if (!isUserInteracting) return;
    if (gyroEnabled && simulatedMotion) {
      deviceAlpha = simStartAlpha + (e.clientX - simStartX) * -0.15;
      deviceBeta = Math.max(-85, Math.min(85, simStartBeta + (e.clientY - simStartY) * 0.15));
      var dist = Math.sqrt(Math.pow(e.clientX - touchStartPos.x, 2) + Math.pow(e.clientY - touchStartPos.y, 2));
      if (dist > 5) isTap = false;
      return;
    }
    var now = Date.now();
    var dt = Math.max(1, now - lastMoveTime);
    lon = (e.clientX - onPointerDownX) * -0.15 + onPointerDownLon;
    lat = (e.clientY - onPointerDownY) * 0.15 + onPointerDownLat;
    velocityX = (e.clientX - lastMoveX) / dt * -8;
    velocityY = (e.clientY - lastMoveY) / dt * 8;
    lastMoveX = e.clientX;
    lastMoveY = e.clientY;
    lastMoveTime = now;
    var dist = Math.sqrt(Math.pow(e.clientX - touchStartPos.x, 2) + Math.pow(e.clientY - touchStartPos.y, 2));
    if (dist > 5) isTap = false;
  }

  function onMouseUp(e) {
    isUserInteracting = false;
    if (isTap && Date.now() - touchStartTime < 300) checkHotspotTap(e.clientX, e.clientY);
  }

  function onWheel(e) {
    e.preventDefault();
    fov = Math.max(60, Math.min(140, fov + e.deltaY * 0.05));
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  function checkHotspotTap(x, y) {
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(hotspotSprites);
    if (intersects.length > 0) {
      var h = intersects[0].object.userData.hotspot;
      if (h && h.type === 'navigation') startTransition();
      sendMessage({ type: 'hotspot_tap', hotspot: h });
      return;
    }

    var nav = pickNavigationHotspotFromRay(raycaster.ray.direction);
    if (nav) {
      startTransition();
      sendMessage({
        type: 'hotspot_tap',
        hotspot: nav.hotspot,
        auto: true,
        source: 'tap_anywhere',
        hit: nav.hit
      });
    }
  }

  function pickNavigationHotspotFromRay(dir) {
    if (!dir || !hotspots || hotspots.length === 0) return null;
    var d = dir.clone().normalize();
    var hitYaw = THREE.MathUtils.radToDeg(Math.atan2(d.x, d.z));
    var hitPitch = THREE.MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, d.y))));

    var best = null;
    var bestScore = Infinity;
    for (var i = 0; i < hotspots.length; i++) {
      var h = hotspots[i];
      if (!h || h.type !== 'navigation' || !h.targetSceneId) continue;
      var dy = angularDistanceDeg(hitYaw, h.yaw);
      var dp = (hitPitch - h.pitch);
      var score = dy * dy + (dp * dp * 2.0);
      if (score < bestScore) {
        bestScore = score;
        best = h;
      }
    }
    if (!best) return null;
    if (bestScore > (55 * 55)) return null;
    return { hotspot: best, hit: { yaw: hitYaw, pitch: hitPitch, score: bestScore } };
  }

  function angularDistanceDeg(a, b) {
    var d = (a - b) % 360;
    if (d < -180) d += 360;
    if (d > 180) d -= 360;
    return Math.abs(d);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function startAnimation() {
    if (animating) return;
    animating = true;
    renderer.setAnimationLoop(animate);
  }

  function animate() {
    if (gyroEnabled && deviceOrientationAvailable && !isUserInteracting) {
      var smooth = gyroSmooth;
      var targetLon = deviceAlpha;
      var targetLat = Math.max(-85, Math.min(85, -deviceBeta));
      var targetRoll = deviceGamma;
      var dLon = targetLon - lon;
      if (dLon > 180) lon += 360; else if (dLon < -180) lon -= 360;
      lon += (targetLon - lon) * smooth;
      lat += (targetLat - lat) * smooth;
      roll += (targetRoll - roll) * smooth;
      velocityX = 0;
      velocityY = 0;
    } else if (!isUserInteracting) {
      lon += velocityX;
      lat += velocityY;
      velocityX *= 0.95;
      velocityY *= 0.95;
      if (Math.abs(velocityX) < 0.01) velocityX = 0;
      if (Math.abs(velocityY) < 0.01) velocityY = 0;
    }

    if (transitioning) {
      fov += (transitionTargetFov - fov) * 0.14;
      camera.fov = fov;
      camera.updateProjectionMatrix();
    } else if (restoringZoom) {
      fov += (transitionTargetFov - fov) * 0.12;
      camera.fov = fov;
      camera.updateProjectionMatrix();
      if (Math.abs(transitionTargetFov - fov) < 0.4) {
        fov = transitionTargetFov;
        camera.fov = fov;
        camera.updateProjectionMatrix();
        restoringZoom = false;
      }
    }

    if (!renderer.xr.isPresenting) {
      camera.position.copy(pos);
      tmpEuler.set(
        THREE.MathUtils.degToRad(lat),
        THREE.MathUtils.degToRad(lon),
        THREE.MathUtils.degToRad(roll),
        'YXZ'
      );
      camera.quaternion.setFromEuler(tmpEuler);
    }

    hotspotSprites.forEach(function(sprite) {
      var dist = camera.position.distanceTo(sprite.position);
      var scaleFactor = Math.max(30, Math.min(60, dist * 0.06));
      sprite.scale.set(scaleFactor, scaleFactor, 1);
    });

    if (videoTexture) videoTexture.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function sendMessage(msg) {
    var str = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(str);
    else if (window.parent && window.parent !== window) window.parent.postMessage(str, '*');
  }

  window.addEventListener('message', handleExternalMessage);
  document.addEventListener('message', handleExternalMessage);

  function handleExternalMessage(e) {
    try {
      var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data.type === 'changeVideo') changeVideo(data.url, data.hotspots);
      else if (data.type === 'toggleAudio') {
        videoEl.muted = !videoEl.muted;
        sendMessage({ type: 'audioState', muted: videoEl.muted });
      }
      else if (data.type === 'toggleGyro' && typeof window.__toggleGyro === 'function') {
        window.__toggleGyro();
      }
    } catch(err) {}
  }

  function changeVideo(url, newHotspots) {
    sendMessage({ type: 'loading' });
    sphereReady = false;
    videoReadyCalled = false;
    hotspots = newHotspots || [];
    videoUrl = url;
    var loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.classList.remove('hidden');

    if (nextVideoEl) {
      try { nextVideoEl.pause(); } catch (e) {}
      nextVideoEl = null;
    }
    if (nextVideoTexture) {
      try { nextVideoTexture.dispose(); } catch (e) {}
      nextVideoTexture = null;
    }

    nextVideoEl = document.createElement('video');
    configureVideoElement(nextVideoEl, url);

    var swapped = false;
    function swapToNext() {
      if (swapped) return;
      swapped = true;
      try {
        nextVideoEl.muted = videoEl ? videoEl.muted : true;
      } catch (e) {}

      nextVideoTexture = new THREE.VideoTexture(nextVideoEl);
      nextVideoTexture.minFilter = THREE.LinearFilter;
      nextVideoTexture.magFilter = THREE.LinearFilter;
      nextVideoTexture.format = THREE.RGBFormat;
      nextVideoTexture.generateMipmaps = false;
      nextVideoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      ensureSphereWithTexture(nextVideoTexture);

      if (videoTexture) { try { videoTexture.dispose(); } catch (e) {} }
      if (videoEl) { try { videoEl.pause(); } catch (e) {} }
      videoEl = nextVideoEl;
      videoTexture = nextVideoTexture;
      nextVideoEl = null;
      nextVideoTexture = null;

      createHotspots();
      hideLoading();
      endTransition();
      sendMessage({ type: 'ready' });
    }

    function onNextReady() {
      if (swapped) return;
      if (nextVideoEl.readyState < 2) return;
      nextVideoEl.play().then(swapToNext).catch(swapToNext);
    }

    nextVideoEl.addEventListener('loadeddata', onNextReady);
    nextVideoEl.addEventListener('canplay', onNextReady);
    nextVideoEl.addEventListener('error', function() {
      var err = nextVideoEl.error;
      var detail = err ? ('code ' + err.code + (err.message ? (': ' + err.message) : '')) : 'unknown';
      console.error('Next video error:', detail, 'src=', url);
      hideLoading();
      endTransition();
      sendMessage({ type: 'error', message: 'Next scene failed to load (' + detail + ')' });
    });

    nextVideoEl.load();
    setTimeout(function() {
      if (!swapped) {
        hideLoading();
        endTransition();
        sendMessage({ type: 'error', message: 'Next scene took too long to load' });
      }
    }, 12000);
  }

  init();
})();
</script>
</body>
</html>`;
}
