class Engine{
    constructor(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90,window.innerWidth/window.innerHeight,0.01,1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.light = new THREE.PointLight(0xffffff,1,1000);
        this.light.castShadow = true;
        this.light.position.set(0,100,0);
        this.scene.add(this.light);
        //this.scene.add(this.light2);
        this.scene.background = new THREE.Color( 0xaaccff );
        this.actors = {};
        this.entities = {};
        this.objects = {};
        this.arrObjects = [];
        this.arrEntities = [];
        this.info = {};
        this.attached = {};
        
        this.running = true;
    }
    render(){
        this.renderer.render(this.scene,this.camera);
    }
    update(time){
        for(let i=0;i<Object.keys(this.actors).length;i++){
            this.actors[Object.keys(this.actors)[i]].update(time);
        }
    }
    addObject(id,obj){
        this.objects[id] = obj;
        this.arrObjects.push(obj);
        this.scene.add(obj);
    }
    addActor(act){
        this.actors[`${act.id}`] = act;
        this.objects[`${act.id}`] = act.object3d;
        this.scene.add(act.object3d);
    }
    displayInfo(id,value){
        let element = document.createElement("p");
        element.class = "hud";
        document.getElementById("hud-container").appendChild(element);
        element.innerText = value;
        this.info[id] = element;
        element.style.left = 10
        element.style.top = 0;
    }
}

class Player{
    constructor(x,y,z){
        this.id = 'player';
        this.velocity = new THREE.Vector3(0,0,0);
        this.object3d = new THREE.Group();
        this.object3d.position.set(x,y,z);
        this.object3d.add(engine.camera);
        this.object3d.userData.parent = this;
        this.inventory = [];
        this.currentGun = 0;
        this.movement = {'front':false,'back':false,'left':false,'right':false,'jump':false};
        this.primaryAction = false;
        this.secondaryAction = false;
        this.rc = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0,-1,0),0,1);
        this.rc2 = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0),0,1.01);
        this.RayCaster = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0),0,1);
        this.stable = true;
        engine.controls = new THREE.PointerLockControls(this.object3d,document.body);
        document.body.addEventListener('click',()=>{
            engine.controls.lock();
        })
    }
    move(delta,x,y,z){
        this.object3d.translateX(x*delta/1000);
        this.object3d.translateY(y*delta/1000);
        this.object3d.translateZ(z*delta/1000);
    }
    inObject(objects){
        this.rc.ray.origin.copy(this.object3d.position);
        let intersections = this.rc.intersectObjects(objects,false);
        return intersections.length > 0;
    }
    onObject(objects){
        this.rc2.ray.origin.copy(this.object3d.position);
        let intersections = this.rc2.intersectObjects(objects,false);
        return intersections.length > 0;
    }
    collide(direction,objects){
        let intersections;
        switch(direction){
            case 'front':
                this.RayCaster.ray.origin.set(0,-1,-0.25);
                this.object3d.localToWorld(this.RayCaster.ray.origin);
                this.RayCaster.ray.origin.y = this.object3d.position.y;
                intersections = this.RayCaster.intersectObjects(objects,false);
                return intersections.length > 0;
            break;
            case 'back':
                this.RayCaster.ray.origin.set(0,-1,0.25);
                this.object3d.localToWorld(this.RayCaster.ray.origin);
                this.RayCaster.ray.origin.y = this.object3d.position.y;
                intersections = this.RayCaster.intersectObjects(objects,false);
                return intersections.length > 0;
            break;
            case 'left':
                this.RayCaster.ray.origin.set(-0.25,-1,0);
                this.object3d.localToWorld(this.RayCaster.ray.origin);
                this.RayCaster.ray.origin.y = this.object3d.position.y;
                intersections = this.RayCaster.intersectObjects(objects,false);
                return intersections.length > 0;
            break;
            case 'right':
                this.RayCaster.ray.origin.set(0.25,-1,0);
                this.object3d.localToWorld(this.RayCaster.ray.origin);
                this.RayCaster.ray.origin.y = this.object3d.position.y;
                intersections = this.RayCaster.intersectObjects(objects,false);
                return intersections.length > 0;
            break;
        }
    }
    update(time){
        let delta = time;
        let mod = 1;
        let mod2 = delta/mod;
        let maxSpeed = 0.1;
        let moveSpeed = 0.25;
        let slowSpeed = 1;
        if(this.movement.front === true){
            if(this.velocity.x < maxSpeed) this.velocity.x += moveSpeed * mod2;
        }
        else if(this.movement.back === true){
            if(this.velocity.x > -maxSpeed) this.velocity.x -= moveSpeed * mod2;
        }
        else{
            if(this.velocity.x > 0){
                this.velocity.x -= slowSpeed * mod2;
            }
            else if(this.velocity.x < 0){
                this.velocity.x += slowSpeed * mod2;
            }
            if(this.velocity.x > -0.01 && this.velocity.x < 0.01){
                this.velocity.x = 0;
            }
        }
        if(this.movement.right === true){
            if(this.velocity.z < maxSpeed) this.velocity.z += moveSpeed * mod2;
        }
        else if(this.movement.left === true){
            if(this.velocity.z > -maxSpeed) this.velocity.z -= moveSpeed * mod2;
        }
        else{
            if(this.velocity.z > 0){
                this.velocity.z -= slowSpeed * mod2;
                if(this.velocity.z < -maxSpeed){
                    this.velocity.z = -moveSpeed;
                }
            }
            else if(this.velocity.z < 0){
                this.velocity.z += slowSpeed * mod2;
                if(this.velocity.z > maxSpeed){
                    this.velocity.z = maxSpeed;
                }
            }
            if(this.velocity.z > -0.01 && this.velocity.z < 0.01){
                this.velocity.z = 0;
            }
        }
        if(this.movement.jump === true && this.canJump){
            this.velocity.y = 0.185;
            this.canJump = false;
            this.jump = true;
        }
        if(!this.onObject(engine.arrObjects)){
            if(this.velocity.y > -1){
                this.velocity.y -= 0.01;
                if(this.onObject(engine.arrObjects) && !this.jump){
                    this.velocity.y = 0;
                }
            }
        }
        if(this.onObject(engine.arrObjects) && !this.jump){
            if(!this.canJump){
                this.canJump = true;
            }
            this.velocity.y = 0;
            while(this.inObject(engine.arrObjects)){
                this.object3d.position.y += 0.01;
            }
        }
        if(this.jump){
            this.jump = false;
        }
        if(this.collide("front",engine.arrObjects) && this.velocity.x > 0){
            this.velocity.x = 0;
        } 
        if(this.collide("back",engine.arrObjects) && this.velocity.x < 0){
            this.velocity.x = 0;
        } 
        if(this.collide("left",engine.arrObjects) && this.velocity.z < 0){
            this.velocity.z = 0;
        } 
        if(this.collide("right",engine.arrObjects) && this.velocity.z > 0){
            this.velocity.z = 0;
        }
        try{
            document.getElementById("speed").innerText = `${this.inventory[this.currentGun].fireDelay}`;
        }
        catch(e){}
        
        this.object3d.position.y += this.velocity.y;
        engine.controls.moveForward(this.velocity.x);
        engine.controls.moveRight(this.velocity.z);

        this.inventory.forEach((gun,index)=>{
            gun.update(time);
        })
        if(this.primaryAction) this.inventory[this.currentGun].fire();

    }
    addGun(gun){
        if(this.inventory.length == 0){
            this.object3d.add(gun.model);
        }
        this.inventory.push(gun);
    }
}
class Tracer{
    constructor(points,time,color){
        this.origin = points[0];
        this.target = points[1];
        this.initialTime = time;
        this.time = time;
        this.alpha = 100;
        this.color = color;
        let material = new THREE.LineBasicMaterial({color:this.color});
        let geometry = new THREE.BufferGeometry().setFromPoints( points );
        let line = new THREE.Line( geometry, material );
        this.line = line;
        engine.scene.add( line );

    }
    update(time){
        if(this.time < 0){
            this.line.removeFromParent();
        }
        else{
            this.time -= time;
        }
    }

}

class Gun{
    constructor(id,damage,magSize,recoil,rpm,hitscan,dispersion){
        this.id = id;
        this.model = null;
        this.offset = new THREE.Vector3(0,0,0);
        this.damage = damage;
        this.magSize = magSize;
        this.recoil = recoil/1000;
        this.cRecoil = 0;
        this.rpm = rpm;
        this.hitscan = hitscan;
        this.fireDelay = 0;
        this.tracers = [];
        this.dispersion = dispersion;
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(),0,1000);
        let texture = textureLoader.load('assets/textures/flash.png');
        let mat = new THREE.SpriteMaterial({
            map:texture,
        })
        this.flash = new THREE.Sprite(mat);
    }
    fire(){
        if(this.fireDelay == 0){
            this.muzzle.add(this.flash);
            this.cRecoil += this.recoil;
            this.offset.z = this.cRecoil;
            this.fireDelay = 1/(this.rpm/60);
            let mV = this.muzzle.position.clone();
            engine.camera.getWorldDirection(this.raycaster.ray.direction);
            let d1 = THREE.MathUtils.randFloat(-this.dispersion,this.dispersion);
            let d2 = THREE.MathUtils.randFloat(-this.dispersion,this.dispersion);
            let d3 = THREE.MathUtils.randFloat(-this.dispersion,this.dispersion);
            let d = new THREE.Vector3(d1,d2,d3);
            this.raycaster.ray.direction.add(d);
            this.muzzle.localToWorld(mV);
            this.raycaster.ray.origin.copy(mV);
            let mod = [...engine.arrObjects];
            let intersections = this.raycaster.intersectObjects(mod);
            let points = [];
            points.push(this.raycaster.ray.origin.clone());
            let v1 = this.raycaster.ray.origin.clone();
            let v2 = this.raycaster.ray.direction.clone();
            v2.multiplyScalar(100);
            v1.add(v2);
            points.push(v1);
            //let tracer = new Tracer(points,0.000250,0xffff00);
            //this.tracers.push(tracer);
            if(intersections.length > 0){
                if(engine.arrEntities.includes(intersections[0].object)){
                    intersections[0].object.userData.parent.onHit(this);
                }
            }
            if(this.checking){
                this.a += 1;
            }
            return true;
        }
    }
    update(time){
        let pos = this.default.clone();
        pos.add(this.offset);
        this.model.position.copy(pos);
        if(this.fireDelay > 0){
            this.fireDelay -= time;
        }
        if(this.fireDelay < 0){
            this.fireDelay = 0;
        }
        if(this.cRecoil > 0){
            this.cRecoil -= time/10;
        }
        else if(this.cRecoil < 0){
            this.cRecoil = 0;
            this.offset.set(0,0,0);
        }
        else if(this.cRecoil == 0){
            if(this.offset.z > 0){
                this.offset.z -= time*10;
            }
            if(this.offset.z < 0){
                this.offset.z = 0;
            }
        }
        if(this.checking){
            this.b += time;
        }
        this.flash.removeFromParent();
    }
    setModel(model){
        this.model = model;
        this.muzzle = new THREE.Object3D();
        this.model.add(this.muzzle);
        this.default = this.model.position.clone();
    }
}

class Enemy{
    constructor(id,){

    }
}

const engine = new Engine();
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new THREE.GLTFLoader();


function init(){
    let player = new Player(0,2,0);
    engine.addActor(player);
    engine.player = player;
    let grass = textureLoader.load('assets/textures/grass2.jpg');
    grass.wrapS = THREE.RepeatWrapping;
    grass.wrapT = THREE.RepeatWrapping;
    grass.repeat.set(100,100);
    engine.addObject('plane',new THREE.Mesh(new THREE.BoxGeometry(100,100,1),new THREE.MeshStandardMaterial({map:grass,side:THREE.DoubleSide})));
    engine.objects.plane.rotateX( - Math.PI / 2 );
    engine.objects.plane.recieveShadow = true;
    let stone = textureLoader.load('assets/textures/stone.jpeg');
    let crosshair = new THREE.Group();
    let p1 = [];
    let p2 = [];
    p1.push(new THREE.Vector3(0,0.002,0));
    p1.push(new THREE.Vector3(0,-0.002,0));
    p2.push(new THREE.Vector3(0.002,0,0));
    p2.push(new THREE.Vector3(-0.002,0,0));
    let g1 = new THREE.BufferGeometry().setFromPoints(p1);
    let g2 = new THREE.BufferGeometry().setFromPoints(p2);
    let mat = new THREE.LineBasicMaterial({
        color:0x000000
    });
    let l1 = new THREE.Line(g1,mat);
    let l2 = new THREE.Line(g2,mat);
    crosshair.add(l1);
    crosshair.add(l2);
    engine.camera.add(crosshair);
    crosshair.position.set(0,0,-0.1);


    let thompson = new Gun(0,10,50,2,600,true,0.01);

    gltfLoader.load("./assets/models/tommy/scene.gltf",(gltf)=>{
        gltf.scene.scale.set(0.1,0.1,0.1);
        gltf.scene.position.set(0.06,-0.05,-0.1);
        gltf.scene.rotateY(Math.PI/2);
        thompson.setModel(gltf.scene);
        player.addGun(thompson);
        thompson.muzzle.position.set(0.4,0.075,0);
        thompson.flash.position.set(0.6,0.12,0);
    });

    const onKeyDown = function ( event ) {
        if(event.repeat){
            return;
        }
        switch ( event.code ) {
            case 'KeyW':
                player.movement.front = true;
            break;
            case 'KeyA':
                player.movement.left = true;
            break;
            case 'KeyS':
                player.movement.back = true;
            break;
            case 'KeyD':
                player.movement.right = true;
            break;
            case 'Space':
                player.movement.jump = true;
            break;
            case 'KeyP':
                if(engine.running){
                    engine.running = false;
                }
                else{
                    engine.running = true;
                }
            break;
            case 'Period':
                engine.update(1);
                engine.render();
            break;
            case 'Comma':
                console.log(engine.player.collide('front',engine.arrObjects));
                //engine.scene.add(new THREE.ArrowHelper(engine.player.rays.front.ray.direction.clone(),engine.player.rays.front.ray.origin.clone(),1));
            break;
        }

    };

    const onKeyUp = function ( event ) {
        switch ( event.code ) {
            case 'KeyW':
                player.movement.front = false;
            break;
            case 'KeyA':
                player.movement.left = false;
            break;
            case 'KeyS':
                player.movement.back = false;
            break;
            case 'KeyD':
                player.movement.right = false;
            break;
            case 'Space':
                player.movement.jump = false;
            break;
        }
    };

    const onMouseDown = function ( event ){
        if(document.hasFocus()){
            if(event.button == 0){
                player.primaryAction = true;
            }
        }
    }

    const onMouseUp = function ( event ){
        if(document.hasFocus()){
            if(event.button == 0){
                player.primaryAction = false;
            }
        }
    }

    document.addEventListener('mousedown',onMouseDown);
    document.addEventListener('mouseup',onMouseUp);
    document.addEventListener('keydown',onKeyDown);
    document.addEventListener('keyup',onKeyUp);
}

let prevTime;

function animate(time){
    requestAnimationFrame(animate);
    if(engine.running){
        let delta = (time-prevTime)/1000;
        engine.update(delta);
        engine.render();
        prevTime = time;
    }
}

const onLoad = function ( event ){
    engine.displayInfo("speed",0);
    init();
}

document.addEventListener('DOMContentLoaded',onLoad);

animate();