let gpsMain= 
{   
    camera :"",
    canvas:"",
    halfCanvas:"",
    touch:false,
    polygonsTxt:[],
    iconInfoP:[],
    groupIDPoygons:[],
    font:"",
    dataAPI:"",
    cubeRF : "",
    pivote :"",
    pivotePoligono:"",
    pivoteCamera:"", 
    checkCalibrado :false,
    poligonosCreados : false,
    difCamara_difHeading :"",
    originCoords :
        {
            lat:0,
            lng: 0
        },
    currentCoords :
        {
            lat:0,
            lng: 0
        },
    updateCoords :
        {
            lat:0,
            lng: 0
        },
        pose: "",
        _onDeviceOrientation : "",
        heading : "",
        
        /* 
        test coordinates mi casa
        */
       
        // testCoordinates: [
        //     {lat:19.359886, lng: -98.980933},//avind-hora
        //     {lat:19.359337, lng:-98.980989}, //avind-pueb
        //     {lat:19.359141, lng:-98.979514}, //avsim-pueb
        //     {lat:19.359719, lng: -98.979399}], //avsim-hora
        //     // {lat:19.359891, lng:-98.980932},
        //     // {lat:19.359904, lng:-98.980599}],
          
           
        // testCoordinates1:[   {"lat":27.4995,"lng":-82.556286},
        //                     {"lat":27.499451,"lng":-82.556323},
        //                     {"lat":27.49934,"lng":-82.556339},
        //                     {"lat":27.499279,"lng":-82.556341},
        //                     {"lat":27.499276,"lng":-82.556388},
        //                     {"lat":27.499306,"lng":-82.556427},
        //                     {"lat":27.499476,"lng":-82.556384},
        //                     {"lat":27.499545,"lng":-82.556325}],
        
        // testCoordinates2:[  {"lat":27.499668,"lng":-82.556634},
        //                     {"lat":27.499621,"lng":-82.556744},
        //                     {"lat":27.499523,"lng":-82.556771},
        //                     {"lat":27.499481,"lng":-82.556701},
        //                     {"lat":27.499533,"lng":-82.556579},
        //                     {"lat":27.499628,"lng":-82.556555}],

        
    SetCameraGps: function ()
    {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position)
                {
                    gpsMain.originCoords.lat = position.coords.latitude;
                    gpsMain.originCoords.lng = position.coords.longitude;
                });
                navigator.geolocation.watchPosition((position)=>
                {
                    gpsMain.currentCoords.lat = position.coords.latitude;
                    gpsMain.currentCoords.lng = position.coords.longitude;
                    if (gpsMain.checkCalibrado)
                    {
                        gpsMain.updatePosition();
                    }

                })
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
        }
        var eventName = this._getDeviceOrientationEventName();
        gpsMain._onDeviceOrientation = gpsMain._onDeviceOrientation.bind(this);
        window.addEventListener(eventName, gpsMain._onDeviceOrientation, false);
        console.log(gpsMain._onDeviceOrientation)
    },
    updateIconInfo()
    {
        gpsMain.iconInfoP.forEach(element => {
            element.lookAt(gpsMain.pose.transform.position.x,gpsMain.pose.transform.position.y,gpsMain.pose.transform.position.z)
        });
        

    },

    updatePosition()
    {
        let coord =gpsMain.coordinateToVirtualSpace(gpsMain.originCoords,gpsMain.currentCoords)
        // console.log(coord)
        // console.log (gpsMain.pivoteCamera.position.x)
        // console.log (coord.x - gpsMain.pivoteCamera.position.x)
        // console.log ("promedio X: " + (coord.x - gpsMain.pivoteCamera.position.x)/2)
        // console.log ("promedio Z: " + (coord.y - gpsMain.pivoteCamera.position.z)/2)
        gpsMain.pivotePoligono.x +=  ((coord.x - gpsMain.pivoteCamera.position.x)/2);
        gpsMain.pivotePoligono.z +=  ((coord.y - gpsMain.pivoteCamera.position.z)/2);

        let dist = gpsMain.computeDistanceMeters(gpsMain.originCoords, gpsMain.currentCoords)
        // document.getElementById("Test").innerHTML = dist
        if (dist>= 200) //200meters
        {
            gpsMain._getVertexPolygon({"lat":gpsMain.currentCoords.lat,"lng":gpsMain.currentCoords.lng},()=>{gpsMain.createPolygonsAPI(gpsMain.dataAPI._position,gpsMain.dataAPI.data)})
            //resert origin coords
            gpsMain.originCoords.lat = position.coords.latitude;
            gpsMain.originCoords.lng = position.coords.longitude;
        }
        // console.log (dist)
        /** update rotation desdpues de calibrar */
        // gpsMain.pivote.rotation.set(0,(gpsMain.difCamara_difHeading)* Math.PI/180,0)
    },
    updateRotation(transform)
    {
        var heading =360- gpsMain.heading;
        gpsMain.cubeRF.lookAt(transform.position.x, gpsMain.cubeRF.position.y,transform.position.z)
        gpsMain.cubeRF.position.set(gpsMain.pose.transform.position.x,gpsMain.cubeRF.position.y,gpsMain.pose.transform.position.z)
        
        var camaraRotationY =gpsMain.toAngle(gpsMain.angleMagnitude(gpsMain.cubeRF.quaternion).y)
        camaraRotationY = gpsMain.normalizeAngle0_360(camaraRotationY)
        
        let difHeading = gpsMain.angulo180(gpsMain.heading)
        let difCamara = (camaraRotationY) //eje z
        let dif = difCamara +difHeading
        gpsMain.difCamara_difHeading = dif;

        if (!gpsMain.checkCalibrado)
        {
            gpsMain.pivote.rotation.set(0,(dif)* Math.PI/180,0)
            gpsMain.pivote.position.set(gpsMain.pose.transform.position.x,gpsMain.pivote.position.y,gpsMain.pose.transform.position.z)         
        }else
        {
            
            // gpsMain.pivoteCamera.rotation.set(0,(dif)* Math.PI/180,0)
            //gpsMain.pivoteCamera.position.set(gpsMain.pose.transform.position.x,gpsMain.pivote.position.y,gpsMain.pose.transform.position.z)
            let pos = gpsMain.pivote.worldToLocal(new THREE.Vector3(gpsMain.pose.transform.position.x,gpsMain.pivote.position.y,gpsMain.pose.transform.position.z))
            
            gpsMain.pivoteCamera.position.copy(pos);
            // console.log (gpsMain.pivoteCamera.position);
            // console.log (gpsMain.pivote.position)
            // console.log ("__")
        }
    },

    updatePolygonsTxt(matrixWorldInverse,projectionMatrix)
    {
        for(let i = 0; i<gpsMain.polygonsTxt.length; i++)
        {
            //gpsMain.polygonsTxt[i].lookAt(gpsMain.pose.transform.position.x,gpsMain.pose.transform.position.y,gpsMain.pose.transform.position.z)
                 
            // get the position of the center of the cube
            let tempV = new THREE.Vector3;
            // let distance = tempV.distanceTo(new THREE.Vector3(gpsMain.pose.transform.position.x,gpsMain.pose.transform.position.z,gpsMain.pose.transform.position.y));
            gpsMain.polygonsTxt[i].center.position.z =-5//( -20 * Math.floor(distance))-2;

            gpsMain.polygonsTxt[i].center.updateWorldMatrix(true, false);
            gpsMain.polygonsTxt[i].center.getWorldPosition(tempV);
            // get the normalized screen coordinate of that position
            // x and y will be in the -1 to +1 range with x = -1 being
            // on the left and y = -1 being on the bottom            
            tempV =  tempV.applyMatrix4(new THREE.Matrix4().fromArray(matrixWorldInverse) ).applyMatrix4( new THREE.Matrix4().fromArray(projectionMatrix) );


            let elem = gpsMain.polygonsTxt[i].elem;
            if ( Math.abs(tempV.z) > 1)
            {
                elem.style.display = 'none';
            }else
            {
                // convert the normalized position to CSS coordinates
                const x = ((tempV.x *  .5 + .5) * gpsMain.canvas.clientWidth)- (elem.offsetWidth/2);
                const y = ((tempV.y * -.5 + .5) * gpsMain.canvas.clientHeight)- (elem.offsetHeight/2);
               
                // elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
                // elem.style.transform = ` translate(${x}px,${y}px)`;
                //elem.style.transform = `translate(-50%, -50%)`
                elem.style.left = x +"px"
                elem.style.top = y+"px"
                elem.style.display = '';
                let closeBtn= elem.querySelector('#closeButton');
                
                  
                let top = y - closeBtn.offsetTop-45
                let left = x + closeBtn.offsetLeft;


                if (top< gpsMain.halfCanvas.height+10 && top >gpsMain.halfCanvas.height-15 )
                {
                    if (left< gpsMain.halfCanvas.width-5&& left> gpsMain.halfCanvas.width-35 )
                    {
                        // console.log (left)
                        if(gpsMain.touch)
                        {
                            closeBtn.onclick()
                        }
                    }
                }             
            }
        }
    },
    openElemen(mesh)
    {
        mesh.openInfo = true;
        gpsMain.polygonsTxt.push({center:mesh.children[0],elem:mesh.elem})
        // let anim = gsap.fromTo(mesh.elem,{css:{transform: "scale(0)"}}, {css:{transform: "scale(1)"},  duration: 2});     
        // anim.play()
        // console.log (mesh.elem)
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
    
    crearcuboReferencia(scene)
    {
        /**
         * plane Compass
         */
         const geometry = new THREE.PlaneGeometry( .2, .2 );
         const texture =new THREE.TextureLoader().load( 'Texture/north.png' );
         const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, map:texture, transparent:true} );
         const plane = new THREE.Mesh( geometry, material );
         plane.position.set(00,-1,0)
         plane.rotation.set(1.5708,1.5708*2,0);
         
        

        // cube. position.set(1.5,0,1.5);
        //cube.visible = false;
        // scene.add(cube)
        // console.log (cube)
        const referencia = new THREE.Object3D();
        //referencia.add(plane)
        gpsMain.cubeRF = referencia;
        scene.add(referencia)
        gpsMain.pivote = new THREE.Object3D();
        gpsMain.pivote.add(plane)
        scene.add(gpsMain.pivote);
        //gpsMain.pivote.materials[0].color = 0xffffff
        //Test
        gpsMain.pivotePoligono = new THREE.Object3D();
        gpsMain.pivote.add(gpsMain.pivotePoligono);
        gpsMain.pivotePoligono.position.set(0,0,0)

        gpsMain.pivoteCamera = new THREE.Object3D();
        let p = plane.clone();
        p.position.y = -1.1;
        p.visible = false
        gpsMain.pivoteCamera.add(p);
        gpsMain.pivote.add(gpsMain.pivoteCamera)

        // let c = gpsMain.createcubeTest();
        // gpsMain.pivote.add(c);
        // c.position.set(2,0,0)

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
    setPivote(floor)
    {
        gpsMain.pivote.position.set(gpsMain.pivote.position.x,floor,gpsMain.pivote.position.z);
    },

    _loadVertexPolygon:function()
    {
        console.log("pedir data")
        
        // gpsMain._getVertexPolygon({"lat":27.4866521,"lng":-82.4035506})
         gpsMain._getVertexPolygon({"lat":27.486832,"lng":-82.403862}) // cerca de un poligono
    //    gpsMain._getVertexPolygon({"lat":gpsMain.currentCoords.lat,"lng":gpsMain.currentCoords.lng})
    },
    
    /*
       get
    */
   _getVertexPolygon:function(_position,callBack)
   {
    //    gpsMain.originCoords.lat =_position.lat;
    //    gpsMain.originCoords.lng = _position.lng;
        const params = 
        {
            key : '8542e207809d040319d4ba71dd4fec9f93fa83ce524d93d27e0738bf8807d130',
            for : 'sumeru',
            lat : _position.lat,
            lng: _position.lng,
            dist_miles: '.25',//400 metros
            url:'https://community.saltstrong.com/api/get_polygons.php?'
        };


        // const url = `${params.url}&key=${params.key}&for=${params.for}&lat=${params.lat}&lng=${params.lng}`;
        const url = `${params.url}&key=${params.key}&for=${params.for}&lat=${params.lat}&lng=${params.lng}&dist_miles=${params.dist_miles}`;
        console.log(url)
        fetch(url)
        .then(res=>{
            console.log(res)
            res.json()
            .then(data=>
                {
                    gpsMain.dataAPI = {data,_position};
                    if (typeof callBack=== 'function') callBack();
                    //gpsMain.createPolygonsAPI(_position,data)
                })
        })
   },
   createPolygonsAPI(_position,data)
   {
        console.log(data.result)
        if (data.result != "No record found")
        {
        //let polygons = JSON.parse( data.result)
        //console.log(data.result.length)

        let polygon =data.result
        let idPolygons_tem = [];
            for(let i = 0; i<polygon.length;i++)
            // for(let i = 0; i<1;i++)
            {
                if (polygon[i].distance<= 0.25) // 400 meters
                {
                    // let grupo = JSON.parse(polygon[i].PolygonCoords);
                    // //gpsMain.createLabel(polygon[i].html,polygon[i].url, polygon[i].Name)
                    // for (let j = 0; j<grupo.length; j++)
                    // // for (let j = 0; j<1; j++)
                    // {
                    //     gpsMain.createPolygon(_position,grupo[j],polygon[i].color,polygon[i].html,polygon[i].url,polygon[i].Name,polygon[i].id)
                    //     //console.log (grupo[j]);

                    // }
                    idPolygons_tem.push(polygon[i]) 
                    console.log (polygon[i])  
                }                             
            }
            gpsMain.checkPolygons(idPolygons_tem, _position)
            if (gpsMain.polygonsTxt.length == 0)// verificar validacion camviar el if por otra variable
            {
                //document.getElementById("Test").innerHTML = "no hay poligonos cerca"
            }
        // console.log(gpsMain.pivotePoligono.children)
        }else
        {
            document.getElementById("Test").innerHTML = "no polygon";
        }
   },

   checkPolygons(newIDPolygons,_position)
   {
    //    console.log("----")
    //    console.log (newIDPolygons)
       let _newPoygonsTemp = newIDPolygons;
       let _deletePolygonsTemp= [];
       if(gpsMain.groupIDPoygons.length!= 0)
       {
            gpsMain.groupIDPoygons.filter(id=>
                {
                    let _temp=newIDPolygons.filter(_newID=> _newID.id == id)
                    if (_temp.length== 0)
                    {
                        // console.log ("eliminar del grupo al: " + id)
                        _deletePolygonsTemp.push(id)                        
                    }else
                    {
                        // console.log ("ya existe"+ id)
                        _newPoygonsTemp = _newPoygonsTemp.filter(_id => _id.id != id);
                    }
                })
            gpsMain.deleteGroups(_deletePolygonsTemp)
            gpsMain.addGroups(_newPoygonsTemp,_position);
            // console.log (gpsMain.groupIDPoygons)
       }
       else
       {
           // todos los poligonos a crear
           gpsMain.addGroups(newIDPolygons,_position)
        //    console.log (gpsMain.groupIDPoygons)
       }

   },
   deleteGroups(ids)
   {
       let mesh
        for (let i = 0 ; i<ids.length;i++)
        {
            gpsMain.groupIDPoygons = gpsMain.groupIDPoygons.filter(g => g.id!= ids[i].id)
            mesh = this.pivotePoligono.children.filter(m=>ids[i].id==m.groupID)
        }
        mesh.forEach(element => {
            gpsMain.pivotePoligono.remove(element)
        });
   },
   addGroups(ids,_position)
   {
        for (let i = 0 ; i<ids.length;i++)
        {
            gpsMain.groupIDPoygons.push(ids[i])
            console.log (ids[i])
            let grupo = JSON.parse(ids[i].PolygonCoords);
            for (let j = 0; j<grupo.length; j++)
            // for (let j = 0; j<1; j++)
            {
                gpsMain.createPolygon(_position,grupo[j],ids[i].color,ids[i].html,ids[i].url,ids[i].Name,ids[i].id)
                //console.log (grupo[j]);

            }
        }
   },
   createcubeTest()
   {
        const geometryc = new THREE.BoxGeometry( 1, 1, 1 );
        const materialc = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
        const cube = new THREE.Mesh( geometryc, materialc );
        return cube;
   },

   /**
     * 
     * @param {Array[json]} dstcoordinates 
     */
    createPolygon(originCoords,dstcoordinates, color,_html,_url,name,groupID)
    {
        //console.log(dstcoordinates);
       const areaPts = [];
       for (let i = 0;i<dstcoordinates.length; i++)
        {
           areaPts.push(gpsMain.coordinateToVirtualSpace(originCoords,dstcoordinates[i]));
        };
        const areaShape =new THREE.Shape( areaPts );
        let centerP = gpsMain.centerPolygon(areaPts);
        // gpsMain.addShape(areaShape,color,gpsMain.pivote,centerP,_html,_url,name ); 
        gpsMain.addShape(areaShape,color,gpsMain.pivotePoligono,centerP,_html,_url,name,groupID ); 
    },       
 
    addShape:function(shape,color,parent,_center,_html,_url,name,groupID)
    {
        // // extruded shape
        // const extrudeSettings = { depth: .1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 1, bevelThickness: 1 };
        // let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        
        // flat shape
        let geometry = new THREE.ShapeGeometry( shape );

        let mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color, side: THREE.DoubleSide, transparent:true, opacity:.45 } ) );
        let center = new THREE.Object3D();
        mesh.add(center) // children [0]
        //var raycast
        let elem = gpsMain.createLabel(_html,_url, name, mesh);
        elem.style.display = "none"
        mesh.elem = elem;
        mesh.isPolygon = true;
        mesh.openInfo = false;
        mesh.groupID = groupID;
        //        
        center.position.copy (_center);


        mesh.position.set( 0, 0, 0 );
        mesh.rotation.set(1.5708,0,0);
        parent.add(mesh)     
        
        //line
        shape.autoClose = true;
        const points = shape.getPoints();
        const geometryPoints = new THREE.BufferGeometry().setFromPoints( points );

        let line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color,linewidth:20 } ) );
	    mesh.add( line );  
        // plane icon info
        let info = gpsMain.createIconInfo();
        mesh.add(info)
        mesh.iconInfoP = info
        info.position.copy(_center)
        
        info.position.z -= 2.5
        info.originPos =  _center;
        info.originPos.z -=2.5
        info.rotation.set(-1.5708,0,0);
        gpsMain.iconInfoP.push( info)

        console.log (info)
    },
    centerPolygon(points)
    {
        let x=0,y=0;
        for(let i = 0; i<points.length; i++)
        {
            x+= points[i].x;
            y+= points[i].y; 
        }
        x = x/points.length;
        y = y/points.length;
        return new THREE.Vector3(x,y,0);
    },
    createLabel:function(txthtml,_url,name,mesh)
    {
        const labelContainerElem = document.querySelector('#labels');
        const elem = document.createElement('div');
        const closeElem = document.createElement('button');
        closeElem.setAttribute("class", "button buttonCloseLabel")
        closeElem.setAttribute("id", "closeButton")

        //close label
        closeElem.onclick = function()
        {
            //gpsMain.polygonsTxt.push({center:mesh.children[0],elem:mesh.elem})
            console.log ("cerrar")
            gpsMain.polygonsTxt = gpsMain.polygonsTxt.filter(_mesh=> _mesh.center.uuid !=mesh.children[0].uuid)
            elem.style.display = "none"
            mesh.openInfo = false;
            mesh.iconInfoP.visible = true;
            mesh.iconInfoP.position.copy ( mesh.iconInfoP.originPos)
            mesh.iconInfoP.visible = true 
        }
        //elem.setAttribute('href',_url)
        
        elem.innerHTML = '<a href="'+_url+'">'+'<p>'+name+"<\/p></a>"+txthtml ;
        //console.log ('<a href="'+_url+'>'+"<p>"+name+"<\/p> "+txthtml +"</a>")        
        labelContainerElem.appendChild(elem);
        elem.appendChild(closeElem);
        return elem;
    },
    /**
     * 
     * @returns  plane
     */
    createIconInfo()
    {
        const geometry = new THREE.PlaneGeometry( 1.5, 1.5 );
         const texture =new THREE.TextureLoader().load( 'Texture/information.png' );
         const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, map:texture, transparent:true} );
         let inf =new THREE.Mesh( geometry, material );
         inf.name = "icon";
         return inf
    },



    /**
     * 
     * @param {Json lng,lat } dstCoords 
     * @returns {Vector2  X, Z}
     */
    coordinateToVirtualSpace(originCoords,dstCoords)
    {
        
        let x,z;
        //z = lat
        z = gpsMain.computeDistanceMeters({lng:0 , lat: originCoords.lat},{lng:0, lat:dstCoords.lat})
        z *= originCoords.lat> dstCoords.lat ? -1:1
        //x = lng
        x = gpsMain.computeDistanceMeters({lng:originCoords.lng, lat:0}, {lng:dstCoords.lng,lat:0})
        x *= originCoords.lng>dstCoords.lng ? 1:-1;
        //console.log("Distance:"+gpsMain.computeDistanceMeters(originCoords,dstCoords) )

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
          /*
        Distance in meters from coordinate
     */
    computeDistanceMeters: function (src, dest) {
        var dlng = THREE.Math.degToRad(dest.lng - src.lng);
        var dlat = THREE.Math.degToRad(dest.lat - src.lat);

        var a = (Math.sin(dlat / 2) * Math.sin(dlat / 2)) + Math.cos(THREE.Math.degToRad(src.lat)) * Math.cos(THREE.Math.degToRad(dest.lat)) * (Math.sin(dlng / 2) * Math.sin(dlng / 2));
        var angle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var distance = angle * 6378160;


        return distance;
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
   
}
