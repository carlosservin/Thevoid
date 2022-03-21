let gpsMain= 
{   
    originCoords :
        {
            latitude:0,
            longitude: 0
        },
    currentCoords :
        {
            latitude:0,
            longitude: 0
        },
        pose: "",
        _onDeviceOrientation : "",
        heading : "",
        cubeTestPivote: "",
        rotateCameraZ : new THREE.Vector3( 0, 0, - 1 ),
        /* 
        test coordinates mi casa
        */
       
        testCoordinates: [
            {latitude:19.359886, longitude: -98.980933},//avind-hora
            {latitude:19.359337, longitude:-98.980989}, //avind-pueb
            {latitude:19.359141, longitude:-98.979514}, //avsim-pueb
            {latitude:19.359719, longitude: -98.979399}], //avsim-hora
            // {latitude:19.359891, longitude:-98.980932},
            // {latitude:19.359904, longitude:-98.980599}],
          
           
        testCoordinates1:[   {"latitude":27.4995,"longitude":-82.556286},
                            {"latitude":27.499451,"longitude":-82.556323},
                            {"latitude":27.49934,"longitude":-82.556339},
                            {"latitude":27.499279,"longitude":-82.556341},
                            {"latitude":27.499276,"longitude":-82.556388},
                            {"latitude":27.499306,"longitude":-82.556427},
                            {"latitude":27.499476,"longitude":-82.556384},
                            {"latitude":27.499545,"longitude":-82.556325}],
        
        testCoordinates2:[  {"latitude":27.499668,"longitude":-82.556634},
                            {"latitude":27.499621,"longitude":-82.556744},
                            {"latitude":27.499523,"longitude":-82.556771},
                            {"latitude":27.499481,"longitude":-82.556701},
                            {"latitude":27.499533,"longitude":-82.556579},
                            {"latitude":27.499628,"longitude":-82.556555}],

        
    SetCameraGps: function ()
    {
            if (navigator.geolocation) {
                //navigator.geolocation.watchPosition(showPosition);
                navigator.geolocation.getCurrentPosition(function (position)
                {
                    gpsMain.originCoords.latitude = position.coords.latitude;
                    gpsMain.originCoords.longitude = position.coords.longitude;
                });
                navigator.geolocation.watchPosition((position)=>
                {
                    gpsMain.currentCoords.latitude = position.coords.latitude;
                    gpsMain.currentCoords.longitude = position.coords.longitude;
                    //document.getElementById("Test2").innerHTML =("latitude: "+position.coords.latitude + "longitude: "+  position.coords.longitude)
                })
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
        }
        var eventName = this._getDeviceOrientationEventName();
        gpsMain._onDeviceOrientation = gpsMain._onDeviceOrientation.bind(this);
        window.addEventListener(eventName, gpsMain._onDeviceOrientation, false);
        console.log(gpsMain._onDeviceOrientation)
    },
    /*
        Distance in meters from coordinate
     */
    computeDistanceMeters: function (src, dest) {
        var dlongitude = THREE.Math.degToRad(dest.longitude - src.longitude);
        var dlatitude = THREE.Math.degToRad(dest.latitude - src.latitude);

        var a = (Math.sin(dlatitude / 2) * Math.sin(dlatitude / 2)) + Math.cos(THREE.Math.degToRad(src.latitude)) * Math.cos(THREE.Math.degToRad(dest.latitude)) * (Math.sin(dlongitude / 2) * Math.sin(dlongitude / 2));
        var angle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var distance = angle * 6378160;


        return distance;
    },

    checkCalibrado :false,
    poligonosCreados : false,
    i:0.0, // borrar
    updateRotation(transform)
    {
        var heading =360- gpsMain.heading;
        gpsMain.cubeRF.lookAt(transform.position.x, gpsMain.cubeRF.position.y,transform.position.z)
        gpsMain.cubeRF.position.set(gpsMain.pose.transform.position.x,gpsMain.cubeRF.position.y,gpsMain.pose.transform.position.z)
        
        var camaraRotationY =gpsMain.toAngle(gpsMain.angleMagnitude(gpsMain.cubeRF.quaternion).y)
        camaraRotationY = gpsMain.normalizeAngle0_360(camaraRotationY)
        let offset =  gpsMain.normalizeAngle0_360(heading+camaraRotationY)
        
        let difHeading = gpsMain.angulo180(gpsMain.heading)
        let difCamara = (camaraRotationY) //eje z
        let dif = difCamara +difHeading
        
        // document.getElementById("Test").innerHTML = difHeading
        // document.getElementById("Test2").innerHTML = difCamara
        // document.getElementById("Test3").innerHTML = dif
        if (!gpsMain.checkCalibrado)
        {
            gpsMain.pivote.rotation.set(0,(dif)* Math.PI/180,0)
            gpsMain.pivote.position.set(gpsMain.pose.transform.position.x,gpsMain.pivote.position.y,gpsMain.pose.transform.position.z)         
        }else
        {

        }
    },
    angulo180(x)
    {
        if (x<180)
        {
            return x
        }else
        {
            return x-360
        }
    },
    /**
     * Axis with angle magnitude (radians) [x, y, z]
     * @param {q} quaternion 
     * @returns vector 3
     */
    angleMagnitude:function(quaternion)
    {
        let q = quaternion.clone();
        let angle = 2 * Math.acos(quaternion.w);
        var axis = [0, 0, 0];
        if (1 - (q.w * q.w) < 0.000001)
        {
            axis[0] = q.x;
            axis[1] = q.y;
            axis[2] = q.z;
        }
        else
        {
            // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
            var s = Math.sqrt(1 - (q.w * q.w));
            axis[0] = q.x / s;
            axis[1] = q.y / s;
            axis[2] = q.z / s;
        }
        return new THREE.Vector3(axis[0]*angle,axis[1]*angle,axis[2]*angle)
    },
    /**
     * 
     * @param {radians} x 
     * @returns Angle
     */
    toAngle: function(x)
    {
        return x * 180 / Math.PI;
    },
    cubeRF : "",
    pivote :"",
    crearcuboReferencia(scene)
    {
        const geometry = new THREE.BoxGeometry( .1, .1, .8 );
        const material = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
        const cube = new THREE.Mesh( geometry, material );
        cube. position.set(0,-1.5,0);
        scene.add(cube)
        gpsMain.cubeRF = cube;
        //2
        const geometry2 = new THREE.BoxGeometry( .15, .15, .15 );
        const material2 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        const cube2 = new THREE.Mesh( geometry2, material2 );
        cube2.position.set(0,0,.4)
        cube.add(cube2);
        gpsMain.pivote =  cube.clone();
        scene.add(gpsMain.pivote);
        //gpsMain.pivote.materials[0].color = 0xffffff
    },
    
    normalizeAngle0_360(angle){
        if (angle<0)
        {
            while(angle<0)
            {
                angle+= 360
            }
        }else if (angle>= 360)
        {
            while (angle>=360)
            {
                angle-= 360;
            }
        }
        return angle;
    },
    
    /**
     * 
     * @param {Array[json]} coordinates 
     */
    createPolygon(coordinates)
    {
        let clon = ""
        
        // elliminar
        const geometry = new THREE.BoxGeometry( 4, 4, 4 );
        const material = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
        const cube = new THREE.Mesh( geometry, material );
       const areaPts = [];
       //fin
       for (let i = 0;i<coordinates.length; i++)
        {
           areaPts.push(gpsMain.coordinateToVirtualSpace(coordinates[i]));
           
           //elminar, test, referencia          
          cube.position.set(areaPts[i].x,gpsMain.i,areaPts[i].y);
          console.log("*****")
          //console.log(new THREE.Vector2(0,0).distanceTo(xz))
          //cube.position.set(1,gpsMain.i,1);       
          clon = cube.clone();
          gpsMain.pivote.add (clon)
        };
        const areaShape =new THREE.Shape( areaPts );
        gpsMain.addShape(areaShape,0xff0000,gpsMain.pivote );     

    },
    addShape:function(shape,color,parent)
    {


        // flat shape
        let geometry = new THREE.ShapeGeometry( shape );
        let mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color, side: THREE.DoubleSide, transparent:true, opacity:.45 } ) );

        mesh.position.set( 0, 0, 0 );
        mesh.rotation.set(1.5708,0,0);
        //gpsMain.cubeTestPivote.add(mesh)
        parent.add(mesh)
        //line
        shape.autoClose = true;
        const points = shape.getPoints();
        const geometryPoints = new THREE.BufferGeometry().setFromPoints( points );

        let line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color,linewidth:20 } ) );
	    mesh.add( line );

    },
    
    /*
       get
    */
   _getVertexPolygon:function(_position)
   {
        const params = 
        {
            key : '8542e207809d040319d4ba71dd4fec9f93fa83ce524d93d27e0738bf8807d130',
            for : 'sumeru',
            lat : _position.lat,
            lng: _position.lng,
            dist_miles: '.126',
            url:'https://community.saltstrong.com/api/get_polygons.php?'
        };


        const url = `${params.url}&key=${params.key}&for=${params.for}&lat=${params.lat}&lng=${params.lng}&dist_miles=${params.dist_miles}`;
        console.log(url)
        fetch(url)
        .then(res=>{
            console.log(res)
            res.json()
            .then(data=>
                {
                    let polygons = JSON.parse( data.result[0].PolygonCoords)
                    

                    let polygonCouter =Object.keys(polygons).length
                    for(let i = 0; i<polygonCouter;i++)
                    {
                        console.log("--"+polygons[i].length )
                        //gpsMain.createPolygon(polygons[i])
                    }
                    console.log(polygons)
                })
        })
   },


    /**
     * 
     * @param {Json longitude,latitude } dstCoords 
     * @returns {vector2  X, Z}
     */
    coordinateToVirtualSpace(dstCoords)
    {
        let x,z;
        //z = latitude
        z = gpsMain.computeDistanceMeters({longitude:0 , latitude: gpsMain.currentCoords.latitude},{longitude:0, latitude:dstCoords.latitude})
        z *= gpsMain.currentCoords.latitude> dstCoords.latitude ? -1:1
        //x = longitude
        x = gpsMain.computeDistanceMeters({longitude:gpsMain.currentCoords.longitude, latitude:0}, {longitude:dstCoords.longitude,latitude:0})
        x *= gpsMain.currentCoords.longitude>dstCoords.longitude ? 1:-1 
        return new THREE.Vector2(x,z)
    },

    createLitScene() {
        const scene = new THREE.Scene();
    
        // The materials will render as a black mesh
        // without lights in our scenes. Let's add an ambient light
        // so our material can be visible, as well as a directional light
        // for the shadow.
        const light = new THREE.AmbientLight(0xffffff, 1);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight.position.set(10, 15, 10);
    
        // We want this light to cast shadow.
        directionalLight.castShadow = true;
    
        // Make a large plane to receive our shadows
        const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
        // Rotate our plane to be parallel to the floor
        planeGeometry.rotateX(-Math.PI / 2);
    
        // Create a mesh with a shadow material, resulting in a mesh
        // that only renders shadows once we flip the `receiveShadow` property.
        const shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({
          color: 0x111111,
          opacity: 0.2,
        }));
    
        // Give it a name so we can reference it later, and set `receiveShadow`
        // to true so that it can render our model's shadow.
        shadowMesh.name = 'shadowMesh';
        shadowMesh.receiveShadow = true;
        shadowMesh.position.y = 10000;
    
        // Add lights and shadow material to scene.
        scene.add(shadowMesh);
        scene.add(light);
        scene.add(directionalLight);
    
        return scene;
      },
      /**
     * Compute compass heading.
     *
     * @param {number} alpha
     * @param {number} beta
     * @param {number} gamma
     *
     * @returns {number} compass heading
     */
    _computeCompassHeading: function (alpha, beta, gamma) {

        // Convert degrees to radians
        var alphaRad = alpha * (Math.PI / 180);
        var betaRad = beta * (Math.PI / 180);
        var gammaRad = gamma * (Math.PI / 180);

        // Calculate equation components
        var cA = Math.cos(alphaRad);
        var sA = Math.sin(alphaRad);
        var sB = Math.sin(betaRad);
        var cG = Math.cos(gammaRad);
        var sG = Math.sin(gammaRad);

        // Calculate A, B, C rotation components
        var rA = - cA * sG - sA * sB * cG;
        var rB = - sA * sG + cA * sB * cG;

        // Calculate compass heading
        var compassHeading = Math.atan(rA / rB);

        // Convert from half unit circle to whole unit circle
        if (rB < 0) {
            compassHeading += Math.PI;
        } else if (rA < 0) {
            compassHeading += 2 * Math.PI;
        }

        // Convert radians to degrees
        compassHeading *= 180 / Math.PI;

        return compassHeading;
    },
          /**
     * Handler for device orientation event.
     *
     * @param {Event} event
     * @returns {void}
     */
    _onDeviceOrientation: function (event) {
        if (event.webkitCompassHeading !== undefined) {
            if (event.webkitCompassAccuracy < 50) {
                gpsMain.heading = event.webkitCompassHeading;
            } else {
                console.warn('webkitCompassAccuracy is event.webkitCompassAccuracy');
            }
        } else if (event.alpha !== null) {
            if (event.absolute === true || event.absolute === undefined) {
                gpsMain.heading = gpsMain._computeCompassHeading(event.alpha, event.beta, event.gamma);
                // console.log("heading " +gpsMain.heading)
                // document.getElementById("Test").innerHTML = gpsMain.heading;
            } else {
                console.warn('event.absolute === false');
            }
        } else {
            console.warn('event.alpha === null');
        }
    },
          /**
     * Get device orientation event name, depends on browser implementation.
     * @returns {string} event name
     */
    _getDeviceOrientationEventName: function () {
        if ('ondeviceorientationabsolute' in window) {
            var eventName = 'deviceorientationabsolute'
        } else if ('ondeviceorientation' in window) {
            var eventName = 'deviceorientation'
        } else {
            var eventName = ''
            console.error('Compass not supported')
        }

        return eventName
    }
   
}
/**
Test de actualizacion
*/