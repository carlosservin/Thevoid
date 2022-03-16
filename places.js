
AFRAME.registerComponent('gruop_places',{
    multiple: true,
    init:function(){
        this.testCoordinates= [
            {latitude:19.360040, longitude: -98.980148},
            {latitude:19.359795, longitude:-98.980204},
            {latitude:19.359825, longitude:-98.980576},
            {latitude:19.359857, longitude:-98.980727},
            {latitude:19.359891, longitude:-98.980932},
            {latitude:19.359904, longitude:-98.980599}];
        this.CreateP = function ()
        {
            const areaPts = [];
            for(let i = 0; i<this.testCoordinates.length;i++)
            {
                let geometry = new THREE.BoxBufferGeometry(1, 1, 1);
                let material = new THREE.MeshStandardMaterial({color: 0xff0000});
                let mesh = new THREE.Mesh(geometry, material);
                this.el.appendChild(this.mesh)

                // Set mesh on entity.
                //this.el.setObject3D('mesh', this.mesh);
                // this.el.getObject3D('mesh').el.setAttribute('look-at',"[gps-camera]")
                // this.el.getObject3D('mesh').el.setAttribute('gps-entity-place',{latitude:this.testCoordinates[i].latitude,longitude:this.testCoordinates[i].longitude })
                console.log(this.el.getObject3D('mesh').el.object3D)
            }
        }
        //this.CreateP();
    console.log (this.el.object3D)
    // Create geometry.
    // this.geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    // // Create material.
    // this.material = new THREE.MeshStandardMaterial({color: 0xff0000});
    // // Create mesh.
    // this.mesh = new THREE.Mesh(this.geometry, this.material);
    // // Set mesh on entity.
    // this.el.setObject3D('mesh', this.mesh);
    //this.el.getObject3D('mesh').setAttribute('position',{x:3,y:0,z:0})
    //this.el.getObject3D('mesh').el.setAttribute('look-at',"[gps-camera]")
    //this.el.getObject3D('mesh').el.setAttribute('gps-entity-place',{latitude:this.testCoordinates[0].latitude,longitude:this.testCoordinates[0].longitude })

    //console.log(this.el.getObject3D('mesh').el.object3D)
    }
});
//createVertex();
function createVertex()
{
    var sceneEl = document.querySelector('a-scene');
    console.log (sceneEl)
    let testCoordinates= [
        {latitude:19.359886, longitude: -98.980933},//avind-hora
        {latitude:19.359337, longitude:-98.980989}, //avind-pueb
        {latitude:19.359141, longitude:-98.979514}, //avsim-pueb
        {latitude:19.359719, longitude: -98.979399}]
    const areaPts = [];

    for(let i = 0; i<testCoordinates.length;i++)
        {
            let entity = document.createElement('a-box');
            entity.setAttribute('vertex','');
            entity.setAttribute('look-at',"[gps-camera]")
            //entity.setAttribute('position',{x:0,y:-1,z:0})
            entity.setAttribute('gps-entity-place',{latitude:testCoordinates[i].latitude,longitude:testCoordinates[i].longitude })
            sceneEl.appendChild(entity);
            console.log (entity.object3D.position)
            //entity.object3D.position.y = -1.5
            
        }
    console.log(sceneEl.object3D);
}
function createPolygon(areaPts,parent)
{
   //const areaPts = [];
   for (let i = 0;i<coordinates.length; i++)
    {
       //areaPts.push(gpsMain.coordinateToVirtualSpace(coordinates[i]));
    //    areaPts.push (new THREE.Vector2(,z))
    };
    const areaShape =new THREE.Shape( areaPts );
    gpsMain.addShape(areaShape,0xff0000,reticle,parent );
   

}

AFRAME.registerComponent('txt',{
    init:function(){
        createVertex();
        //console.log (this.el.object3D)
    }
});