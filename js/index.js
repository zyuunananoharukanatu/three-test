window.addEventListener('DOMContentLoaded', init);

let camera;
let scene = new THREE.Scene();
scene.background = new THREE.Color( 0xFFFFFF );
let renderer;

function update() {
	renderer.render(scene, camera);
	requestAnimationFrame(update);
}

function init() {
	let loader = new THREE.GLTFLoader();
	let path = 'gltf/Duck.glb';
	loader.load(path, function(gltf){
		modelObj = gltf.scene;

		// モデルをSceneに追加
		scene.add(modelObj);

		// モデルの表示を微調整...
		// ここでは縮尺（scale）を調整
		let gltfBox = new THREE.Box3().setFromObject(modelObj);
		let gltfScale = 1 / (gltfBox.max.x - gltfBox.min.x) * 25;
		modelObj.scale.set(gltfScale, gltfScale, gltfScale);

		/** ポイントクラウドを読込モデルから生成 **/
		let pointCloudGeo = new THREE.BufferGeometry();
		let pointCloudObj3dTypes = [
			'Mesh', 'SkinnedMesh'
		];

		// Scene内の全MeshをGeometryに結合する
		scene.traverse(function(obj3d){
			if(pointCloudObj3dTypes.includes(obj3d.type)){
				let geo = new THREE.BufferGeometry(obj3d.geometry)
				let mesh = new THREE.Mesh(geo, obj3d.material);
				mesh.applyMatrix4(obj3d.matrix);
				mesh.updateMatrix();
				pointCloudGeo.merge(mesh.geometry, mesh.matrix);
			}
		}.bind(this));

		// 結合が終わったらポイントクラウド生成
		let pointCloud = new THREE.Points(
			pointCloudGeo, new THREE.PointsMaterial({
				// 点のサイズ
				size: 100, 
				// 点の色
				color: 0x601500,
				// サイズ減退の有無
				sizeAttenuation: false
			})
		);

		// サイズ調整とかしてSceneに追加
		let pointBox = new THREE.Box3().setFromObject(pointCloud);
		let pointScale = 1 / (pointBox.max.x - pointBox.min.x) * 25;
		pointCloud.scale.set(pointScale, pointScale, pointScale);
		scene.add(pointCloud);

		// ひとまずモデル自体は非表示に
		// modelObj.visible = false;
	});

	// 表示用設定
	const width = 960;
	const height = 540;
	const canvasEle = document.querySelector("#myCanvas");
	renderer = new THREE.WebGLRenderer({
		canvas: canvasEle
	})
	
	//光源
	const frontlight = new THREE.AmbientLight(0xffffff, 0.6); // color,強度
	frontlight.position.set(10, 30, 1000);
	scene.add(frontlight);
	const backlight = new THREE.SpotLight(0x00ff00, 2.0); // color,強度
	backlight.position.set(10, 30, -1000);
	scene.add(backlight);
	const toplight = new THREE.SpotLight(0xff0000, 2.0); // color,強度
	toplight.position.set(10, 1000, 10);
	scene.add(toplight);

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
	camera.position.set(40, 30, 50);
	camera.lookAt(new THREE.Vector3(0, 10, 0));
	const controls = new THREE.OrbitControls(camera, canvasEle);
	controls.enableDamping = true;
	controls.dampingFactor = 0.2;

	update();
}
