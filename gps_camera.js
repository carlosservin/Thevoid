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
    crearcubosDeReferenciatest(scene,pos)
    {
        const geometry = new THREE.BoxGeometry( .1, 2, .1 );
        const material = new THREE.MeshBasicMaterial( {color: 0xff00ff} );
        const cube = new THREE.Mesh( geometry, material );


        const materials = [
            new THREE.MeshBasicMaterial( {color: 0xff0000} ),
            new THREE.MeshBasicMaterial( {color: 0x0000ff} ),
            new THREE.MeshBasicMaterial( {color: 0x00ffff} ),
            new THREE.MeshBasicMaterial( {color: 0xffffff} )
        ]
        const box1 = new THREE.Mesh(new THREE.BoxBufferGeometry(.2, .2, .2), materials[0]);
        const box2 = new THREE.Mesh(new THREE.BoxBufferGeometry(0.1, 0.1, 0.1), materials[1]);
        const box3 = new THREE.Mesh(new THREE.BoxBufferGeometry(0.5, 0.5, 0.5), materials[2]);
        const box4 = new THREE.Mesh(new THREE.BoxBufferGeometry(0.05, 0.05, 0.4), materials[3]);
        
        box1.add(box2);
        gpsMain.cubeTestPivote = box1;
        // gpsMain.createPuntoTest1(cube,pos, gpsMain.testCoordinates[0]);
        // gpsMain.createPuntoTest1(cube,pos, gpsMain.testCoordinates[1]); 
        // gpsMain.createPuntoTest1(cube,pos, gpsMain.testCoordinates[2]); 
        // gpsMain.createPuntoTest1(cube,pos, gpsMain.testCoordinates[3]); 
        // gpsMain.createPuntoTest1(cube,pos, gpsMain.testCoordinates[4]);  
        // gpsMain.createPuntoTest1(cube,pos, gpsMain.testCoordinates[5]); 
        gpsMain.createPolygon(gpsMain.testCoordinates,pos,box2)
        box2.position.z+=1;
        //box1.add(box3);
        box3.position.set(1,pos.y,2);
       box1.position.copy(pos);
        
        box4.position.copy(pos)
        box4.rotation.x = 0
        box4.rotation.z = 0
        // box4.lookAt(pos)
        box4.lookAt(gpsMain.pose.transform.position.x, pos.y,gpsMain.pose.transform.position.z)     
        box4.quaternion.normalize();
        var angle= (2*Math.acos( box4.quaternion.w)*180/Math.PI)
        box4.quaternion.y<0 ? angle*= -1 :angle *= 1 
        angle = gpsMain.normalizeAngle0_360(angle);
        //  console.log("angle" + angle)
        //  console.log("heading"+ gpsMain.heading)        
        
        // console.log ("------__________")
        // console.log(gpsMain.normalizeAngle0_360(gpsMain.heading +180 + angle))
        
        box1.rotation.set(0,gpsMain.normalizeAngle0_360(gpsMain.heading +180 + angle)*Math.PI/180,0);
        // /regresar  a donde se encuentra el usuario
        // console.log("...")
        console.log(box1.position)
        /**
         * box1 se encuentra en el lugar del usuario coordenadas actuales
         * x = posicion del usuario x
         * y = la altura del suelo  y
         * z = posicion del usuario z
         */
        box1.position.set(gpsMain.pose.transform.position.x,pos.y,gpsMain.pose.transform.position.z)
        //document.getElementById("Test").innerHTML = "box X"+box1.position.x +" y"+ box1.position.y +" z"+ box1.position.z;
        console.log(box1.position)
        scene.add(box1);

        scene.add(box4)

        // // diferencia
        // var dif;
        // if (gpsMain.heading<180)
        // {
        //     dif = angle+gpsMain.heading;
        // }
        // else
        // {
        //     //dif=(360-gpsMain.heading)+angle;
        //     dif = (180-gpsMain.heading) + angle
        // }
        // // box1.rotation.set(0,gpsMain.normalizeAngle0_360(dif)*Math.PI/180,0);
        // console.log(dif);

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
    createPuntoTest1(obj,reticle,dstCoords)
    {
        if (obj)
        {
            const clone =obj.clone();

            let pos ={x:0, z:0};//19.359829784873142, -98.98040303696732
            //19.359772422065554, -98.98021321382504  mi cuarto
            //19.359846, -98.980252 arbol
            
            // let dstCoords = 
            // {
            //     latitude:19.359846,
            //     longitude: -98.980252
            // }
            // pos.x = gpsMain.computeDistanceMeters(gpsMain.originCoords,dstCoords)
            // pos.x *= gpsMain.currentCoords.longitude> gpsMain.originCoords.longitude ? 1 :-1;

            // pos.z = gpsMain.computeDistanceMeters(gpsMain.originCoords,dstCoords)
            // pos.z *= gpsMain.currentCoords.latitude> gpsMain.originCoords.latitude? -1:1;

            //z = latitude
            pos.z = gpsMain.computeDistanceMeters({longitude:0 , latitude: gpsMain.currentCoords.latitude},{longitude:0, latitude:dstCoords.latitude})
            pos.z *= gpsMain.currentCoords.latitude> dstCoords.latitude ? -1:1
            //x = longitude
            pos.x = gpsMain.computeDistanceMeters({longitude:gpsMain.currentCoords.longitude, latitude:0}, {longitude:dstCoords.longitude,latitude:0})
            pos.x *= gpsMain.currentCoords.longitude>dstCoords.longitude ? 1:-1

            //norte lo represento en el eje z
                // pos.z = gpsMain.computeDistanceMeters({longitude:0, latitude:gpsMain.currentCoords.latitude }, {longitude:0, latitude:dstCoords.latitude  })
                // pos.z *= gpsMain.currentCoords.longitude> dstCoords.longitude ? -1 :1; 
                // pos.x = gpsMain.computeDistanceMeters({longitude:gpsMain.currentCoords.longitude, latitude:0 }, {longitude: dstCoords.longitude, latitude:0  })
                // pos.x *= gpsMain.currentCoords.latitude> gpsMain.originCoords.latitude? -1:1;
            //=======

                // pos.x =gpsMain.computeDistanceMeters({longitude:0, latitude:gpsMain.currentCoords.latitude }, {longitude:0, latitude:dstCoords.latitude  })
                // pos.x *= gpsMain.currentCoords.longitude> gpsMain.originCoords.longitude ? -1 :1;
                // pos.z =gpsMain.computeDistanceMeters({longitude:gpsMain.currentCoords.longitude, latitude:0 }, {longitude: dstCoords.longitude, latitude:0  })
                // pos.z *= gpsMain.currentCoords.latitude> gpsMain.originCoords.latitude? 1:-1;
            
            gpsMain.cubeTestPivote.add(clone);

            clone.position.set(pos.x,reticle.y,pos.z);
            //clone.position.set(pos.z,reticle.y,pos.x);
            //clone.position.copy(pos)                //checar bien las dimensiones
            console.log(clone)
            console.log("clone")
            //scene.add(clone);
            var distancia=gpsMain.computeDistanceMeters(gpsMain.currentCoords, dstCoords)
            console.log("posX: "+pos.x + "   pos Z: " + pos.z + " distancia:  "+ distancia );

        }

    },
    /**
     * 
     * @param {Array[json]} coordinates 
     */
    createPolygon(coordinates,parent)
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
           //
        };

        // test
// cube.position.set(2,0,5);
// clon = cube.clone();
// gpsMain.pivote.add (clon)

// cube.position.set(-2,0,3);
// clon = cube.clone();
// gpsMain.pivote.add (clon)

// cube.position.set(-2,0,-3);
// clon = cube.clone();
// gpsMain.pivote.add (clon)

// cube.position.set(2,0,-3);
// clon = cube.clone();
// gpsMain.pivote.add (clon)
    // areaPts.push(new THREE.Vector2(2,5))
    // areaPts.push(new THREE.Vector2(-2,3))
    // areaPts.push(new THREE.Vector2(-2,-3))
    // areaPts.push(new THREE.Vector2(2,-3))
console.log (areaPts)
   //fin
        const areaShape =new THREE.Shape( areaPts );
        gpsMain.addShape(areaShape,0xff0000,parent );
       

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
    },
    /*
        post
    */
   _getPolygonCoords: function(position)
   {
    const params = 
    {
        key : '8542e207809d040319d4ba71dd4fec9f93fa83ce524d93d27e0738bf8807d130',
        for : 'sumeru',
        lat : position.lat,
        lng: position.lng,
        dist_miles: '.126',
        url:'https://community.saltstrong.com/api/get_polygons.php?'
    };

        // CORS Proxy to avoid CORS problems
const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    const Url = `${params.url}&key=${params.key}&for=${params.for}&lat=${params.lat}&lng=${params.lng}&dist_miles=${params.dist_miles}`;
       //const Url ='https://url';
       const data=
       {
           lat:123456789,
           ign:987654321
       }
       $.ajax(
           {
               
               url: Url,
            //    type:"POST",
            //    data:data,
               success: function(result)
               {
                    //CreatePolygon
                    console.log (data);
               },
               error:function(error)
               {
                   console.log("Error" + error);
               }
           })
   },
   _getVertexPoligon:function(position)
   {
        const params = 
        {
            key : '8542e207809d040319d4ba71dd4fec9f93fa83ce524d93d27e0738bf8807d130',
            for : 'sumeru',
            lat : position.lat,
            lng: position.lng,
            dist_miles: '.126',
            url:'https://community.saltstrong.com/api/get_polygons.php?'
        };

            // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

        const url = `${corsProxy}${params.url}&key=${params.key}&for=${params.for}&lat=${params.lat}&lng=${params.lng}&dist_miles=${params.dist_miles}`;
        console.log(url)
        fetch(url)
        .then(res=>{
            console.log(res)
            res.json()
            .then(data=>
                {
                    console.log(data)
                })
        })
   },
   _getVertexPoligonTest:function(position)
   {
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const form = new FormData();

    fetch(corsProxy+"https://community.saltstrong.com/api/get_polygons.php?key=8542e207809d040319d4ba71dd4fec9f93fa83ce524d93d27e0738bf8807d130&for=sumeru&lat=27.4995&lng=-82.556286&dist_miles=.126", {
      "method": "GET",
      "headers": {
        
        "Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
      }
    })
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.error(err);
    });
   },
   _getVertexPoligonTest2:function(position)
   {
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const form = new FormData();

    fetch("https://community.saltstrong.com/api/get_polygons.php?key=8542e207809d040319d4ba71dd4fec9f93fa83ce524d93d27e0738bf8807d130&for=sumeru&lat=27.4995&lng=-82.556286&dist_miles=.126", {
      "method": "GET",
      "headers": {
        
        "Content-Type": "multipart/form-data; boundary=---011000010111000001101001"
      }
    })
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.error(err);
    });
   }

}