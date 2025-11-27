# 360° VR Tour Videos

This folder contains 360-degree panoramic videos for the ELIDZ STP Services VR tours.

## Folder Structure

```
360-tours/
├── analytical-laboratory/
│   └── analytical-laboratory-main.mp4 (single video for entire facility)
├── digital-hub/
│   ├── auditorium/
│   │   └── auditorium-main.mp4
│   ├── broadcasting-studio/
│   │   └── broadcasting-main.mp4
│   └── digital-units/
│       └── digital-units-main.mp4
├── design-centre/
│   ├── cad-3d-printing/
│   │   └── cad-3d-printing-main.mp4
│   └── cnc-milling/
│       └── cnc-milling-main.mp4
├── renewable-energy/
│   └── renewable-energy-main.mp4 (single video for entire facility)
└── automotive-incubator/
    ├── industrial-incubation-units/
    │   └── industrial-incubation-main.mp4
    └── shared-ancillary-services/
        └── shared-ancillary-main.mp4
```

## Video Requirements

- **Format**: MP4 or MOV files
- **Resolution**: Minimum 4K (3840x2160) for best quality
- **Projection**: Equirectangular (360° spherical)
- **Frame Rate**: 30fps minimum
- **Bitrate**: 50-100 Mbps for optimal quality
- **File Size**: Keep under 500MB per video for mobile performance

## Naming Convention

Please name your video files according to this pattern:
`{facility}-{service}-{scene}.mp4`

Examples:
- `analytical-laboratory-sample-intake-main.mp4`
- `digital-hub-auditorium-stage.mp4`
- `design-centre-cad-3d-printing-workstation.mp4`

## Usage in App

The videos will be referenced in `mobile/src/data/vrToursData.ts` under each facility's scene configuration. Update the `image` property from placeholder URLs to local video paths:

```typescript
scenes: {
  'scene-id': {
    id: 'scene-id',
    title: 'Scene Title',
    image: require('../../../assets/videos/360-tours/facility/service/video.mp4'),
    hotspots: [...]
  }
}
```

## Upload Instructions

1. Place your 360° videos in the appropriate service folders
2. Ensure videos are optimized for mobile playback
3. Test videos in the app to verify they load correctly
4. Update the vrToursData.ts file with the correct video paths
