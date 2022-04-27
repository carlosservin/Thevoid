let gpsMain= 
{   
    camera :"",
    screenSize:"",
    halfScreenSize:"",
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
    difCamara_difHeading :0,
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

        _onDeviceOrientation : "",
        heading : "",
        // coords_accuracy:"",

    SetCameraGps: function ()
    {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position)
            {
                gpsMain.originCoords.lat = position.coords.latitude;
                gpsMain.originCoords.lng = position.coords.longitude;
                // gpsMain.coords_accuracy = document.getElementById("coordsAccuracy")
                // gpsMain.coords_accuracy.innerHTML ="The accuracy of position: "+ (Math.round( position.coords.accuracy *  1.094)) +" yard"
                // gpsMain.coords_accuracy.style.display = "block"
                
            });
            navigator.geolocation.watchPosition((position)=>
            {
                gpsMain.currentCoords.lat = position.coords.latitude;
                gpsMain.currentCoords.lng = position.coords.longitude;
                // console.log("lat  "+position.coords.latitude + "  lgn  "+position.coords.longitude)
                if (gpsMain.checkCalibrado)
                {
                    gpsMain.updatePosition();
                    // gpsMain.coords_accuracy.innerHTML ="The accuracy of position: "+ (Math.round( position.coords.accuracy *  1.094)) +" yard"
                }

            })
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
        var eventName = this._getDeviceOrientationEventName();
        gpsMain._onDeviceOrientation = gpsMain._onDeviceOrientation.bind(this);
        window.addEventListener(eventName, gpsMain._onDeviceOrientation, false);
    },


    updatePosition()
    {
        let coord =gpsMain.coordinateToVirtualSpace(gpsMain.originCoords,gpsMain.currentCoords)
        // console.log(coord)

        gpsMain.pivotePoligono.position.x =  coord.x;
        gpsMain.pivotePoligono.position.z =  coord.y;
        let dist = gpsMain.computeDistanceMeters(gpsMain.originCoords, gpsMain.currentCoords)
        // document.getElementById("Test").innerHTML = dist
        if (dist>= 100) //100meters
        {
            gpsMain._getVertexPolygon({"lat":gpsMain.currentCoords.lat,"lng":gpsMain.currentCoords.lng},()=>{gpsMain.createPolygonsAPI(gpsMain.dataAPI._position,gpsMain.dataAPI.data)})
            //resert origin coords
            gpsMain.originCoords.lat = gpsMain.currentCoords.lat;
            gpsMain.originCoords.lng = gpsMain.currentCoords.lng;
        }
    },
    updateRotarionCamera(matrix)
    {
        // console.log (matrix)
        const m = new THREE.Matrix4().fromArray(matrix)
        let mPosition = new THREE.Vector3();
        let mQuaternion= new THREE.Quaternion();
        let mScale= new THREE.Vector3();
        m.decompose(mPosition,mQuaternion,mScale)
        // console.log (mQuaternion)      
        let poseY =gpsMain.toAngle(gpsMain.angleMagnitude(mQuaternion).y)
        poseY = Math.round( gpsMain.normalizeAngle0_360(poseY+180))
        // console.log (poseY)

        
        let difHeading = Math.round(gpsMain.angulo180(gpsMain.heading))
        let dif = Math.round(poseY +difHeading)
        if (Math.abs(dif-gpsMain.difCamara_difHeading)>7 )
        {
            // console.log ("actualizar")
            gpsMain.difCamara_difHeading = dif
            gpsMain.pivote.rotation.set(0,(dif)* Math.PI/180,0)
            gpsMain.pivote.position.set(mPosition.x,-1.5,mPosition.z)  

            let pos = gpsMain.pivote.worldToLocal(new THREE.Vector3(mPosition.x,gpsMain.pivote.position.y,mPosition.z))
            
            gpsMain.pivoteCamera.position.copy(pos);
        }     
        // document.getElementById("Test").innerHTML = gpsMain.heading
        // document.getElementById("Test2").innerHTML = poseY
        // document.getElementById("Test3").innerHTML = gpsMain.angulo180(dif)
    },

    updatePolygonsTxt(matrixWorldInverse,projectionMatrix,pose)
    {
        for(let i = 0; i<gpsMain.polygonsTxt.length; i++)
        {
                 
            // get the position of the center of the cube
            let tempV = new THREE.Vector3;            

            gpsMain.polygonsTxt[i].center.updateWorldMatrix(true, false);
            gpsMain.polygonsTxt[i].center.getWorldPosition(tempV);
            let distancia = tempV.distanceTo(new THREE.Vector3(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z)) 
            //altura del ele html
            tempV.y =+ ((distancia/100)*10)+2

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
                const x = ((tempV.x *  .5 + .5) * gpsMain.screenSize.width)- (elem.offsetWidth/2);
                const y = ((tempV.y * -.5 + .5) * gpsMain.screenSize.height)- (elem.offsetHeight/2);
               
                // elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
                // elem.style.transform = ` translate(${x}px,${y}px)`;
                //elem.style.transform = `translate(-50%, -50%)`
                elem.style.left = x +"px"
                elem.style.top = y+"px"
                
                if (elem.style.display == 'none')
                {
                    elem.style.opacity =0
                    console.log ("prender")
                    gpsMain.delay(550).then( ()=>elem.style.opacity =1)

                }
               elem.style.display = ''
                /** Btn close Button*/
                let btn= elem.querySelector('#closeButton');
                let top = y - btn.offsetTop;
                let left = x + btn.offsetLeft;                
                if (top -45< gpsMain.halfScreenSize.height+35 && top-45 >gpsMain.halfScreenSize.height+10 ) // -45 margin-top
                {
                    if (left< gpsMain.halfScreenSize.width-5&& left> gpsMain.halfScreenSize.width-35 )
                    {
                        // console.log (left)
                        if(gpsMain.touch)
                        {
                            btn.onclick()
                        }
                    }
                }
                /**btn url */
                btn= elem.querySelector('#btnUrl');
                top = y + btn.offsetTop;
                left = x + btn.offsetLeft+5; 
                // console.log (left)
                if (top<gpsMain.halfScreenSize.height&& top>gpsMain.halfScreenSize.height-btn.offsetHeight)
                {
                    if (left<gpsMain.halfScreenSize.width && left>gpsMain.halfScreenSize.width- btn.offsetWidth)
                    {
                        if(gpsMain.touch)
                        {
                            btn.onclick()
                        }
                    }
                }        
                
            }
        }
    },
    updateIconInfo(pose)
    {
        gpsMain.iconInfoP.forEach(element => {
            element.lookAt(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z)
            let distance = new THREE.Vector3;
            element.getWorldPosition(distance);
            distance = distance.distanceTo(new THREE.Vector3(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z));
            let scale = ((distance/100)*2)+1;
             element.parent.scale.set(scale,scale,scale)
             element.parent.position.z = -((distance/100)*5)-2
        });
        

    },
    openElemen(mesh)
    {
        mesh.openInfo = true;
        gpsMain.polygonsTxt.push({center:mesh.children[0],elem:mesh.elem})
        mesh.elem.style.display = 'none';
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
         
        
        //  const geometryB = new THREE.BoxGeometry( 1, 1, 1 );
        //  const materialB = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        //  const cube = new THREE.Mesh( geometryB, materialB );
         
        // cube. position.set(0,0,2);
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
        // gpsMain.pivote.add( cube );
    },

    setCrearPolygons()
    {
        gpsMain.createPolygonsAPI(gpsMain.dataAPI._position,gpsMain.dataAPI.data)
        document.body.classList.add('stabilized');
        // this.reticle.visible = false;
        // document.querySelector('#calibrating').style.display = 'none';
        document.querySelector('#mira').style.display= 'block'

        //canvas
        // gpsMain.canvas =document.getElementById("container");  //this.canvas;
        // gpsMain.halfCanvas ={width: gpsMain.canvas.clientWidth/2, height:gpsMain.canvas.clientHeight/2}
        // console.log (gpsMain.canvas.clientHeight)
        gpsMain.screenSize = {width: window.innerWidth, height:window.innerHeight}
        gpsMain.halfScreenSize= {width: window.innerWidth/2, height:window.innerHeight/2}
    },

    _loadVertexPolygon:function()
    {
        // console.log("pedir data")
        
        // gpsMain._getVertexPolygon({"lat":27.4866521,"lng":-82.4035506})
        //  gpsMain._getVertexPolygon({"lat":27.486832,"lng":-82.403862}) // cerca de un poligono
       gpsMain._getVertexPolygon({"lat":gpsMain.currentCoords.lat,"lng":gpsMain.currentCoords.lng})
    // gpsMain._getVertexPolygon({"lat":27.546,"lng":-82.58481})
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
            dist_miles: '.5',//400 metros
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
                    console.log (data)
                    gpsMain.dataAPI = {data,_position};
                    if (typeof callBack=== 'function') callBack();
                    gpsMain.setCrearPolygons()
                    gpsMain.checkCalibrado = true;
                })
        })
   },
   createPolygonsAPI(_position,data)
   {
        // console.log(data.result)
        if (data.status !="error")
        {

        
            if (data.result != "No record found")
            {
            //let polygons = JSON.parse( data.result)
            //console.log(data.result.length)
            document.querySelector('#txtMessage').parentElement.style.display= 'none'
            let polygon =data.result
            let idPolygons_tem = [];
                for(let i = 0; i<polygon.length;i++)
                // for(let i = 0; i<1;i++)
                {
                    if (polygon[i].distance<= 0.5) // 800 meters
                    {
                        idPolygons_tem.push(polygon[i]) 
                        // console.log (polygon[i])  
                    }                             
                }
                gpsMain.checkPolygons(idPolygons_tem, _position)
            }else
            {
                let msg = document.querySelector('#txtMessage');
                msg.innerHTML= data.result;
                msg.parentElement.style.display= 'block'
                /**delete poligons */
                gpsMain.checkPolygons([],_position)

            }
        }else
        {
            let msg = document.querySelector('#txtMessage');
            msg.innerHTML= data.message;
            msg.parentElement.style.display= 'block'
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
       console.log ("delete")
       console.log (ids)
       let mesh
        for (let i = 0 ; i<ids.length;i++)
        {
            gpsMain.groupIDPoygons = gpsMain.groupIDPoygons.filter(g => g.id!= ids[i].id)
            mesh = this.pivotePoligono.children.filter(m=>ids[i].id==m.groupID)
            mesh.forEach(element => {
                    gpsMain.pivotePoligono.remove(element)
                });
        }
        // console.log (mesh)
        // mesh.forEach(element => {
        //     gpsMain.pivotePoligono.remove(element)
        // });
   },
   addGroups(ids,_position)
   {
       console.log ("agregar")
    console.log (ids)
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
   createcubeTest()                                             //borrar
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
        gpsMain.iconInfoP.push( info.children[0])//children[0] => plane geometry

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
            console.log (mesh.iconInfoP.children[0])
            gpsMain.polygonsTxt = gpsMain.polygonsTxt.filter(_mesh=> _mesh.center.uuid !=mesh.children[0].uuid)
            elem.style.display = "none"
            mesh.openInfo = false;
            // mesh.iconInfoP.children[0].position.copy ( mesh.iconInfoP.originPos)
            mesh.iconInfoP.children[0].scale.set (1,1,1)
            mesh.iconInfoP.children[0].position.set (0,0,0)
            gpsMain.delay(600).then(()=>mesh.iconInfoP.children[0].visible = true )
            
        }
        //elem.setAttribute('href',_url)
        const btnUrl = document.createElement('button');
        btnUrl.setAttribute("class", "button buttonUrl")
        btnUrl.setAttribute("id", "btnUrl");
        btnUrl.innerHTML = name;
        btnUrl.onclick = function()
        {
            // console.log ("abrir url")
            window.location.href = _url
        }
        /** txt html */
        const txtHtml = document.createElement('div');
        txtHtml.innerHTML = txthtml
        // elem.innerHTML = '<a href="'+_url+'">'+'<p>'+name+"<\/p></a>"+txthtml ;
        // console.log (elem)
        //console.log ('<a href="'+_url+'>'+"<p>"+name+"<\/p> "+txthtml +"</a>")        
        labelContainerElem.appendChild(elem);
        elem.appendChild(closeElem);
        elem.appendChild(btnUrl)
        elem.appendChild(txtHtml)

        return elem;
    },
    /**
     * 
     * @returns  plane
     */
    createIconInfo()
    {
        const parent =  new THREE.Object3D()
        const geometry = new THREE.PlaneGeometry( 1.5, 1.5 );
         const texture =new THREE.TextureLoader().load( 'Texture/information.png' );
         const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, map:texture, transparent:true} );
         let inf =new THREE.Mesh( geometry, material );
         inf.name = "icon";
         parent.add(inf)
         return parent
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
                console.log ('webkitCompassAccuracy is event.webkitCompassAccuracy')
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
    delay: function(time)
    {
        return new Promise (resolve=>setTimeout(resolve,time))
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
       
   
}
