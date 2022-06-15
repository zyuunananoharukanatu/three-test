window.addEventListener('DOMContentLoaded', init);
function init() {
	var loader = new GLTFLoader();
	var path = '../glTF-Sample-Models\2.0\Duck\glTF-Binary/duck.glb';
	loader.load(path, function(gltf){
	  var modelObj = gltf.scene;
	 
	  /// モデルをSceneに追加
	  scene.add(modelObj);
	  
	  /// モデルの表示を微調整...
	  /// ここでは縮尺（scale）を調整
	  var box = new THREE.Box3().setFromObject(modelObj);
	  var scale = 1 / (box.max.x - box.min.x) * 10;
	  modelObj.scale.set(scale, scale, scale);
	  
	  /** ポイントクラウドを読込モデルから生成 **/
	  var pointCloudGeo = new THREE.Geometry();
	  var pointCloudObj3dTypes = [
	    'Mesh', 'SkinnedMesh'
	  ];

	  /// Scene内の全MeshをGeometryに結合する
	  scene.traverse(function(obj3d){
	    if(pointCloudObj3dTypes.includes(obj3d.type)){
	      var geo = new THREE.Geometry()
	        .fromBufferGeometry(obj3d.geometry);
	      var mesh = new THREE.Mesh(geo, obj3d.material);
	      mesh.applyMatrix4(obj3d.matrix);
	      mesh.updateMatrix();
	      pointCloudGeo.merge(mesh.geometry, mesh.matrix);
	    }
	  }.bind(this));

	  /// 結合が終わったらポイントクラウド生成
	  var pointCloud = new THREE.Points(
	    pointCloudGeo, new THREE.PointsMaterial({
	      /// 点のサイズ
	      size: 1, 
	      /// 点の色
	      color: 0xFFFFFF,
	      /// サイズ減退の有無
	      sizeAttenuation: false
	    })
	  );

	  /// サイズ調整とかしてSceneに追加
	  var box = new THREE.Box3().setFromObject(pointCloud);
	  var scale = 1 / (box.max.x - box.min.x) * 10;
	  pointCloud.scale.set(scale, scale, scale);
	  scene.add(pointCloud);

	  /// ひとまずモデル自体は非表示に
	  modelObj.visible = false;
	});
}