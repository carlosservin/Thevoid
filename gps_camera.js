let gpsMain= 
{   
    screenSize:"",
    halfScreenSize:"",
    touch:false,
    polygonsTxt:[],
    iconInfoP:[],
    groupIDPoygons:[],
    dataAPI:"",
    pivote :"",
    pivotePoligono:"",
    createdPolygons :false,
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
        heading : "",
        // coords_accuracy:"",
/**
 * set gps variables
 * position update
 */
    SetGps: function ()
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
                /**Update */
                if (gpsMain.createdPolygons)
                {
                    gpsMain.positionUpdate();
                }

            })
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
        // var eventName = this._getDeviceOrientationEventName();
        // gpsMain._onDeviceOrientation = gpsMain._onDeviceOrientation.bind(this);
        // window.addEventListener(eventName, gpsMain._onDeviceOrientation, false);

        var eventName = gpsMain._getDeviceOrientationEventName();
        gpsMain._onDeviceOrientation = gpsMain._onDeviceOrientation.bind(gpsMain);
        window.addEventListener(eventName, gpsMain._onDeviceOrientation, false);

    },

/**
 * update parent position of polygons
 */
    positionUpdate()
    {
        let coord =gpsMain.coordinateToVirtualSpace(gpsMain.originCoords,gpsMain.currentCoords)
        gpsMain.pivotePoligono.position.x =  coord.x;
        gpsMain.pivotePoligono.position.z =  coord.y;

        /**get distance from original position to current position */
        let dist = gpsMain.computeDistanceMeters(gpsMain.originCoords, gpsMain.currentCoords)
        if (dist>= 100) //100meters
        {
            gpsMain.getGroupsPolygonsAPI({"lat":gpsMain.currentCoords.lat,"lng":gpsMain.currentCoords.lng},()=>{gpsMain.createPolygons(gpsMain.dataAPI.coord,gpsMain.dataAPI.data)})
            //resert origin coordinates
            gpsMain.originCoords.lat = gpsMain.currentCoords.lat;
            gpsMain.originCoords.lng = gpsMain.currentCoords.lng;
        }
    },
    /**
     * 
     * @param {matrix} matrix 
     */
    updateCameraRotation(matrix)
    {
        /**decompose matrix, in position, rotation and scale */
        const m = new THREE.Matrix4().fromArray(matrix)
        let mPosition = new THREE.Vector3();
        let mQuaternion= new THREE.Quaternion();
        let mScale= new THREE.Vector3();
        m.decompose(mPosition,mQuaternion,mScale)

        /**get the rotation on the Y axis */
        let poseY =gpsMain.toAngle(gpsMain.angleMagnitude(mQuaternion).y)
        poseY = Math.round( gpsMain.normalizeAngle0_360(poseY+180))

        /**calculate compass degree */
        let difHeading = Math.round(gpsMain.angle180(gpsMain.heading))
        /**calculate compass difference and camera rotation */
        let dif = Math.round(poseY +difHeading)
        /**decrease the effect of shaky */
        if (Math.abs(dif-gpsMain.difCamara_difHeading)>7 )
        {
            gpsMain.difCamara_difHeading = dif
            gpsMain.pivote.rotation.set(0,(dif)* Math.PI/180,0)
            gpsMain.pivote.position.set(mPosition.x,-1.5,mPosition.z)              
        }     
    },
    /**
     * update html elements that are open and detect the click with the crosshairs
     * @param {Matrix} matrixWorldInverse 
     * @param {Matrix} projectionMatrix 
     * @param {pose} pose 
     */
    updatePolygonsTxt(matrixWorldInverse,projectionMatrix,pose)
    {
        /**update html elements that are open */
        for(let i = 0; i<gpsMain.polygonsTxt.length; i++)
        {
            //get the center of the polygon     
            let tempV = new THREE.Vector3;          
            gpsMain.polygonsTxt[i].center.updateWorldMatrix(true, false);
            gpsMain.polygonsTxt[i].center.getWorldPosition(tempV);

            /**calculate the distance from the center to the camera */
            let distance = tempV.distanceTo(new THREE.Vector3(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z)) 

            /**set height relative to distance */
            tempV.y =+ ((distance/100)*10)+2

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
                elem.style.left = x +"px"
                elem.style.top = y+"px"
                /**delay to display the item */
                if (elem.style.display == 'none')
                {
                    elem.style.opacity =0
                    gpsMain.delay(550).then( ()=>elem.style.opacity =1)

                }
               elem.style.display = ''
                /** Btn close Button*/
                /**calculate the position of the button div */
                let btn= elem.querySelector('#closeButton');
                let top = y - btn.offsetTop;
                let left = x + btn.offsetLeft;                
                if (top -45< gpsMain.halfScreenSize.height+35 && top-45 >gpsMain.halfScreenSize.height+10 ) // -45 margin-top
                {
                    if (left< gpsMain.halfScreenSize.width-5&& left> gpsMain.halfScreenSize.width-35 )
                    {
                        /**if crosshair is inside button area and clicked, activate function */
                        if(gpsMain.touch)
                        {
                            btn.onclick()
                        }
                    }
                }
                /**btn url */
                /**calculate the position of the button div */
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
                            /**if crosshair is inside button area and clicked, activate function */
                            btn.onclick()
                        }
                    }
                }        
                
            }
        }
    },
    /**
     * update buttons to show polygon information
     * @param {Pose} pose 
     */
    updateInfoIcon(pose)
    {
        gpsMain.iconInfoP.forEach(element => {
            /**set the info button to look at the virtual camera*/
            element.lookAt(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z)
            /**calculate the distance from the button to the camera */
            let distance = new THREE.Vector3;
            element.getWorldPosition(distance);
            distance = distance.distanceTo(new THREE.Vector3(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z));
            /**scale the button relative to the distance */
            let scale = ((distance/100)*2)+1;
             element.parent.scale.set(scale,scale,scale)
             /**set button height relative to distance */
             element.parent.position.z = -((distance/100)*5)-2
        });      
    },
    /**
     * open information
     * @param {Object3D} mesh 
     */
    openElemen(mesh)
    {
        /**open information (html) */
        mesh.openInfo = true;
        /**add the div to the array to calculate its position on update */
        gpsMain.polygonsTxt.push({center:mesh.children[0],elem:mesh.elem})
        mesh.elem.style.display = 'none';
    },

    /** create reference 3d objects */
    createReference3DObjects(scene)
    {
        /**
         * plane Compass
         */
         const geometry = new THREE.PlaneGeometry( .4, .4 );
         const texture =new THREE.TextureLoader().load( 'Texture/north.png' );
         const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, map:texture, transparent:true} );
         const plane = new THREE.Mesh( geometry, material );
         plane.position.set(00,-1,0)
         plane.rotation.set(1.5708,1.5708*2,0);

        gpsMain.pivote = new THREE.Object3D();
        gpsMain.pivote.add(plane)
        scene.add(gpsMain.pivote);
        
        gpsMain.pivotePoligono = new THREE.Object3D();
        gpsMain.pivote.add(gpsMain.pivotePoligono);
        gpsMain.pivotePoligono.position.set(0,0,0)
    },


    /** load polygons from the api*/
    _loadVertexPolygon:function()
    {       
        // gpsMain.getGroupsPolygonsAPI({"lat":27.4866521,"lng":-82.4035506})
        //  gpsMain.getGroupsPolygonsAPI({"lat":27.486832,"lng":-82.403862}) // cerca de un poligono
        // gpsMain.getGroupsPolygonsAPI({"lat":27.546,"lng":-82.58481})
       gpsMain.getGroupsPolygonsAPI({"lat":gpsMain.currentCoords.lat,"lng":gpsMain.currentCoords.lng})

    },
    

   /**
    * get data
    * @param {json} coord 
    * @param {funcion} callBack 
    */
   getGroupsPolygonsAPI:function(coord,callBack)
   {

        const params = 
        {
            key : '8542e207809d040319d4ba71dd4fec9f93fa83ce524d93d27e0738bf8807d130',
            for : 'sumeru',
            lat : coord.lat,
            lng: coord.lng,
            dist_miles: '.5',//800 metros
            url:'https://community.saltstrong.com/api/get_polygons.php?'
        };
        const url = `${params.url}&key=${params.key}&for=${params.for}&lat=${params.lat}&lng=${params.lng}&dist_miles=${params.dist_miles}`;
        fetch(url)
        .then(res=>{
            res.json()
            .then(data=>
                {
                    gpsMain.dataAPI = {data,coord};
                    if (typeof callBack=== 'function') callBack();
                    gpsMain.setPolygonsCreations()
                    gpsMain.createdPolygons = true;
                })
        })
   },
   /**
    * set polygon creation 
    * set canvas values
    */
   setPolygonsCreations()
   {
       gpsMain.createPolygons(gpsMain.dataAPI.coord,gpsMain.dataAPI.data)
       document.body.classList.add('stabilized');

       document.querySelector('#crosshairs').style.display= 'block'

       gpsMain.screenSize = {width: window.innerWidth, height:window.innerHeight}
       gpsMain.halfScreenSize= {width: window.innerWidth/2, height:window.innerHeight/2}
   },
   /**
    * create polygons
    * @param {json} coord 
    * @param {json} data 
    */
   createPolygons(coord,data)
   {
        if (data.status !="error")
        {        
            if (data.result != "No record found")
            {
            document.querySelector('#txtMessage').parentElement.style.display= 'none'
            let polygon =data.result
            let idPolygons_tem = [];
                for(let i = 0; i<polygon.length;i++)
                {
                    if (polygon[i].distance<= 0.5) // 800 meters
                    {
                        idPolygons_tem.push(polygon[i]) 
                    }                             
                }
                gpsMain.checkPolygons(idPolygons_tem, coord)
            }else
            {
                /*show message label*/
                let msg = document.querySelector('#txtMessage');
                msg.innerHTML= data.result;
                msg.parentElement.style.display= 'block'
                /**delete poligons */
                gpsMain.checkPolygons([],coord)

            }
        }else
        {
            /**show message label */
            let msg = document.querySelector('#txtMessage');
            msg.innerHTML= data.message;
            msg.parentElement.style.display= 'block'
        }
   },
   /**
    * 
    * @param {Array} newIDPolygons 
    * @param {json} coord {lat:a, lng:b}
    */
   checkPolygons(newIDPolygons,coord)
   {
       let _newPoygonsTemp = newIDPolygons;
       let _deletePolygonsTemp= [];
       if(gpsMain.groupIDPoygons.length!= 0)
       {
            gpsMain.groupIDPoygons.filter(id=>
                {
                    let _temp=newIDPolygons.filter(_newID=> _newID.id == id)
                    if (_temp.length== 0)
                    {
                        /**delete group with id */
                        _deletePolygonsTemp.push(id)                        
                    }else
                    {
                        /**check new groups */
                        _newPoygonsTemp = _newPoygonsTemp.filter(_id => _id.id != id);
                    }
                })
            gpsMain.deleteGroups(_deletePolygonsTemp)
            gpsMain.addGroups(_newPoygonsTemp,coord);
       }
       else
       {
           /**create all polygon groups */
           gpsMain.addGroups(newIDPolygons,coord)
       }

   },
   /**
    * remove polygons from group
    * @param {Array} ids grupos 
    */
   deleteGroups(ids)
   {
       let mesh
        for (let i = 0 ; i<ids.length;i++)
        {
            gpsMain.groupIDPoygons = gpsMain.groupIDPoygons.filter(g => g.id!= ids[i].id)
            mesh = this.pivotePoligono.children.filter(m=>ids[i].id==m.groupID)
            mesh.forEach(element => {
                    gpsMain.pivotePoligono.remove(element)
                });
        }
   },
   /**
    * add the group polygons
    * @param {Array} ids 
    * @param {json} coord 
    */
   addGroups(ids,coord)
   {
        for (let i = 0 ; i<ids.length;i++)
        {
            gpsMain.groupIDPoygons.push(ids[i])
            let group = JSON.parse(ids[i].PolygonCoords);
            for (let j = 0; j<group.length; j++)
            {
                gpsMain.createPolygon(coord,group[j],ids[i].color,ids[i].html,ids[i].url,ids[i].Name,ids[i].id)
            }
        }
   },
    /**
     * 
     * @param {json} originCoords 
     * @param {Array} group 
     * @param {Hex} color 
     * @param {string} _html 
     * @param {string} _url 
     * @param {string} name 
     * @param {int} groupID 
     */
    createPolygon(originCoords,group, color,_html,_url,name,groupID)
    {
       const areaPts = [];
       for (let i = 0;i<group.length; i++)
        {
           areaPts.push(gpsMain.coordinateToVirtualSpace(originCoords,group[i]));
        };
        /**build shape */
        const areaShape =new THREE.Shape( areaPts );
        let centerP = gpsMain.getCenterPolygon(areaPts);
        gpsMain.addShape(areaShape,color,gpsMain.pivotePoligono,centerP,_html,_url,name,groupID ); 
    },       
    /**
     * 
     * @param {THREE.Shape} shape 
     * @param {Hex} color 
     * @param {THREE.Object3D} parent 
     * @param {Vector3} _center 
     * @param {string} _html 
     * @param {string} _url 
     * @param {string} name 
     * @param {int} groupID 
     */
    addShape:function(shape,color,parent,_center,_html,_url,name,groupID)
    {        
        // flat shape
        let geometry = new THREE.ShapeGeometry( shape );
        let mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color, side: THREE.DoubleSide, transparent:true, opacity:.45 } ) );
        let center = new THREE.Object3D();
        mesh.add(center) // children [0]

        /**create  label (html)*/
        let elem = gpsMain.createLabel(_html,_url, name, mesh);
        /** add reference label to mesh*/
        mesh.elem = elem;
        /**reference variables */
        mesh.isPolygon = true;
        mesh.openInfo = false;
        mesh.groupID = groupID;

        center.position.copy (_center);

        /**set Polygon */
        mesh.position.set( 0, 0, 0 );
        mesh.rotation.set(1.5708,0,0);
        parent.add(mesh)     
        
        //line
        shape.autoClose = true;
        const points = shape.getPoints();
        const geometryPoints = new THREE.BufferGeometry().setFromPoints( points );

        let line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color,linewidth:20 } ) );
	    mesh.add( line );

        /**set polygon info button */
        let info = gpsMain.createIconInfo();
        mesh.add(info)
        mesh.iconInfoP = info
        
        info.position.copy(_center)        
        info.position.z -= 2.5
        info.rotation.set(-1.5708,0,0);

        /**  add the info btn to the array for use in the raycast*/
        gpsMain.iconInfoP.push( info.children[0])//children[0] => plane geometry
    },
    /**
     * 
     * @param {Vector2[]} points 
     * @returns {Vector3} CenterPolygon
     */
    getCenterPolygon(points)
    {
        let x=0,y=0;
        for(let i = 0; i<points.length; i++)
        {
            x+= points[i].x;
            y+= points[i].y; 
        }
        /**average */
        x = x/points.length;
        y = y/points.length;
        return new THREE.Vector3(x,y,0);
    },
    /**
     * create label that is displayed when the polygon information button is clicked
     * @param {string} txthtml 
     * @param {string} _url 
     * @param {string} name 
     * @param {object} mesh 
     * @returns htmlElement
     */
    createLabel:function(txthtml,_url,name,mesh)
    {
        /**set label */
        const labelContainerElem = document.querySelector('#labels');
        const elem = document.createElement('div');
        const closeElem = document.createElement('button');
        closeElem.setAttribute("class", "button buttonCloseLabel")
        closeElem.setAttribute("id", "closeButton")

        /**set variables when element is closed */
        closeElem.onclick = function()
        {
            /**remove the element from the array of polygons Txt so that its position is not calculated */
            gpsMain.polygonsTxt = gpsMain.polygonsTxt.filter(_mesh=> _mesh.center.uuid !=mesh.children[0].uuid)
            elem.style.display = "none"
            mesh.openInfo = false;
            mesh.iconInfoP.children[0].scale.set (1,1,1)
            mesh.iconInfoP.children[0].position.set (0,0,0)
            /**delay to not show htmj element move effect */
            gpsMain.delay(600).then(()=>mesh.iconInfoP.children[0].visible = true )
            
        }
        /**set polygon url button */
        const btnUrl = document.createElement('button');
        btnUrl.setAttribute("class", "button buttonUrl")
        btnUrl.setAttribute("id", "btnUrl");
        btnUrl.innerHTML = name;
        btnUrl.onclick = function()
        {
            window.location.href = _url
        }

        /** set polygon text */
        const txtHtml = document.createElement('div');
        txtHtml.innerHTML = txthtml

        
        labelContainerElem.appendChild(elem);
        elem.appendChild(closeElem);
        elem.appendChild(btnUrl)
        elem.appendChild(txtHtml)
        elem.style.display = "none"
        return elem;
    },
    /**
     * Plane like button
     * @returns  plane
     */
    createIconInfo()
    {
        /**hierarchy=> Object3D.children(PlaneGeometry) */
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
    /**
     * 
     * @param {float} x 
     * @returns  float angle -180 to 180
     */
     angle180(x)
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
       
   
}
