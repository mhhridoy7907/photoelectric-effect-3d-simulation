
/* ---------------- SLIDES ---------------- */
let slides = [
`When light (especially high-energy light like UV) is incident on a metal surface, electrons are emitted from that metal. This phenomenon is called the photoelectric effect.`,

`How it works:
Light consists of small packets of energy called photons
When photons hit the metal surface, they transfer energy to the electrons in the metal
If the energy of the photons is sufficient, electrons are ejected from the metal
These emitted electrons are called photoelectrons`,

`Main idea:
Light behaves not only as a wave but also as a particle
The energy of each photon is fixed (E = hf)
Not all light can eject electrons—only light with enough energy can do it (there must be a threshold frequency)`
];

let slideIndex = 0;

function updateSlide(){
    document.getElementById("slideTitle").innerText = "Slide " + (slideIndex + 1);
    document.getElementById("slideText").innerText = slides[slideIndex];
}

function nextSlide(){
    slideIndex = (slideIndex + 1) % slides.length;
    updateSlide();
}

function prevSlide(){
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    updateSlide();
}

updateSlide();

/* ---------------- THREE JS ---------------- */

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,6,30);

let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* LIGHT */
scene.add(new THREE.AmbientLight(0xffffff,0.1));

let sunLight = new THREE.PointLight(0xffee88,0);
sunLight.position.set(0,18,0);
scene.add(sunLight);

/* SUN */
let sun = new THREE.Mesh(
    new THREE.SphereGeometry(2,32,32),
    new THREE.MeshBasicMaterial({color:0x333333})
);
sun.position.set(0,18,0);
scene.add(sun);

/* TUBE */
let tube = new THREE.Mesh(
    new THREE.CylinderGeometry(3,3,18,40),
    new THREE.MeshStandardMaterial({
        color:0x88ccff,
        transparent:true,
        opacity:0.15
    })
);
tube.rotation.z = Math.PI/2;
scene.add(tube);

/* CATHODE + ANODE */
let cathode = new THREE.Mesh(
    new THREE.BoxGeometry(0.8,3,3),
    new THREE.MeshStandardMaterial({color:0x222222, metalness:1})
);
cathode.position.set(-9,0,0);
scene.add(cathode);

let anode = cathode.clone();
anode.position.set(9,0,0);
scene.add(anode);

/* BATTERY */
let battery = new THREE.Mesh(
    new THREE.BoxGeometry(5,1.5,1.5),
    new THREE.MeshStandardMaterial({color:0xff4444})
);
battery.position.set(0,-10,0);
scene.add(battery);

/* METER */
let meterGroup = new THREE.Group();
meterGroup.position.set(15,2,0);
scene.add(meterGroup);

let dial = new THREE.Mesh(
    new THREE.CylinderGeometry(3,3,0.6,64),
    new THREE.MeshStandardMaterial({color:0x111111})
);
dial.rotation.x = Math.PI/2;
meterGroup.add(dial);

let needlePivot = new THREE.Group();
needlePivot.position.z = 0.6;
meterGroup.add(needlePivot);

let needle = new THREE.Mesh(
    new THREE.BoxGeometry(0.08,3.2,0.1),
    new THREE.MeshBasicMaterial({color:0xff0000})
);

needle.position.set(0,1.5,0);
needlePivot.add(needle);

/* WIRES */
function createWire(points,color){
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({color})
    );
}

scene.add(createWire([
    new THREE.Vector3(-9,0,0),
    new THREE.Vector3(-15,0,0),
    new THREE.Vector3(-15,-6,0),
    new THREE.Vector3(0,-10,0)
],0x0066ff));

scene.add(createWire([
    new THREE.Vector3(0,-10,0),
    new THREE.Vector3(15,-10,0),
    new THREE.Vector3(15,2,0)
],0xff3333));

scene.add(createWire([
    new THREE.Vector3(9,0,0),
    new THREE.Vector3(15,0,0),
    new THREE.Vector3(15,2,0)
],0xff3333));

/* ELECTRONS */
let electrons = [];

for(let i=0;i<80;i++){
    let e = new THREE.Mesh(
        new THREE.SphereGeometry(0.1,12,12),
        new THREE.MeshBasicMaterial({color:0x00ff66})
    );

    e.position.set(-8 + Math.random()*16, (Math.random()-0.5)*1.5,(Math.random()-0.5)*1.5);
    e.visible = false;
    scene.add(e);

    electrons.push({mesh:e,speed:0.06+Math.random()*0.04});
}

/* LIGHT TOGGLE */
let lightOn = false;

function toggleLight(){
    lightOn = !lightOn;

    sunLight.intensity = lightOn ? 2 : 0;
    sun.material.color.set(lightOn ? 0xffcc00 : 0x333333);

    electrons.forEach(e=>{
        e.mesh.visible = lightOn;
    });
}

/* ANIMATION */
let voltage = 0;
let needleAngle = 0;

function animate(){
    requestAnimationFrame(animate);

    voltage *= 0.97;

    electrons.forEach(e=>{
        if(lightOn){
            e.mesh.position.x += e.speed;

            if(e.mesh.position.x > 8){
                e.mesh.position.x = -8;
                voltage += 0.02;
            }
        }
    });

    voltage = Math.min(voltage, 1.0);

    let targetAngle = -Math.PI*0.75 + voltage * (Math.PI*1.5);
    needleAngle += (targetAngle - needleAngle) * 0.08;

    needlePivot.rotation.z = needleAngle;

    controls.update();
    renderer.render(scene,camera);
}

animate();

/* RESIZE */
window.addEventListener("resize",()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});
