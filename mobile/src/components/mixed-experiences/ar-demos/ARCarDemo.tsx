import { useState } from 'react';
import {
	ViroARScene, ViroMaterials, ViroNode, ViroAnimations, Viro3DObject, ViroLightingEnvironment,
	ViroARImageMarker, ViroARTrackingTargets, ViroSphere, ViroSpotLight, ViroQuad,
} from '@reactvision/react-viro';


export default function ARCarDemo() {
	const [pauseUpdates, setPauseUpdates] = useState(false);
	const [animName, setAnimName] = useState("idle");
	const [playAnim, setPlayAnim] = useState(true);
	const [animateCar, setAnimateCar] = useState(false);
	const [texture, setTexture] = useState<any>({
		texture: "white",
		tapWhite: false,
		tapBlue: false,
		tapGrey: false,
		tapRed: false,
		tapYellow: false,
	});

	const _onAnchorFound = () => {
		setPauseUpdates(false);
		setAnimateCar(true);
	};
	const _selectWhite = () => {
		setTexture({
			texture: "white",
			tapWhite: true
		});
	};
	const _selectBlue = () => {
		setTexture({
			texture: "blue",
			tapBlue: true
		});
	};
	const _selectGrey = () => {
		setTexture({ texture: "grey", tapGrey: true });
	};
	const _selectRed = () => {
		setTexture({ texture: "red", tapRed: true });
	};
	const _selectYellow = () => {
		setTexture({ texture: "yellow", tapYellow: true });
	};
	const _animateFinished = () => {
		setTexture({ texture: "white", tapWhite: false });
		setTexture({ texture: "blue", tapBlue: false });
		setTexture({ texture: "grey", tapGrey: false });
		setTexture({ texture: "red", tapRed: false });
	};
	const _toggleButtons = () => {
		setPlayAnim(!playAnim);
	};


	return (
		<ViroARScene>

			<ViroLightingEnvironment source={require('./vr-objects/tesla/garage_1k.hdr')} />

			<ViroARImageMarker target={"logo"} onAnchorFound={_onAnchorFound} pauseUpdates={pauseUpdates}>
				<ViroNode scale={[0, 0, 0]} transformBehaviors={["billboardY"]} animation={{ name: animName, run: playAnim, }}>
					<ViroSphere materials={["white_sphere"]}
						heightSegmentCount={20} widthSegmentCount={20} radius={.03}
						position={[-.2, .25, 0]}
						onClick={_selectWhite}
						animation={{ name: "tapAnimation", run: texture.tapWhite, onFinish: _animateFinished }}
						shadowCastingBitMask={0} />

					<ViroSphere materials={["blue_sphere"]}
						heightSegmentCount={20} widthSegmentCount={20} radius={.03}
						position={[-.1, .25, 0]}
						onClick={_selectBlue}
						animation={{ name: "tapAnimation", run: texture.tapBlue, onFinish: _animateFinished }}
						shadowCastingBitMask={0} />

					<ViroSphere materials={["grey_sphere"]}
						heightSegmentCount={20} widthSegmentCount={20} radius={.03}
						position={[0, .25, 0]}
						onClick={_selectGrey}
						animation={{ name: "tapAnimation", run: texture.tapGrey, onFinish: _animateFinished }}
						shadowCastingBitMask={0} />

					<ViroSphere materials={["red_sphere"]}
						heightSegmentCount={20} widthSegmentCount={20} radius={.03}
						position={[.1, .25, 0]}
						onClick={_selectRed}
						animation={{ name: "tapAnimation", run: texture.tapRed, onFinish: _animateFinished }}
						shadowCastingBitMask={0} />

					<ViroSphere materials={["yellow_sphere"]}
						heightSegmentCount={20} widthSegmentCount={20} radius={.03}
						position={[.2, .25, 0]}
						onClick={_selectYellow}
						animation={{ name: "tapAnimation", run: texture.tapYellow, onFinish: _animateFinished }}
						shadowCastingBitMask={0} />
				</ViroNode>

				<Viro3DObject
					scale={[0, 0, 0]}
					source={require('./vr-objects/tesla/object_car.obj')}
					resources={[require('./vr-objects/tesla/object_car.mtl'),
					]}
					type="OBJ"
					materials={texture}
					onClick={_toggleButtons}
					animation={{ name: "scaleCar", run: animateCar, }} />

				<ViroSpotLight
					innerAngle={5}
					outerAngle={25}
					direction={[0, -1, 0]}
					position={[0, 5, 1]}
					color="#ffffff"
					castsShadow={true}
					shadowMapSize={2048}
					shadowNearZ={2}
					shadowFarZ={7}
					shadowOpacity={.7} />

				<ViroQuad
					rotation={[-90, 0, 0]}
					position={[0, -0.001, 0]}
					width={2.5} height={2.5}
					arShadowReceiver={true} />

			</ViroARImageMarker>
		</ViroARScene>
	)
}