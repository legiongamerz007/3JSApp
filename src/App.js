import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css"; // Add a CSS file for additional styling

// Component to load and display 3D models with interactions
const Model = ({ path, interactive, followCursor, scale = 0.8, position = [0, 0, 0] }) => {
  const modelRef = useRef();
  const { scene, animations } = useGLTF(path);
  const { actions } = useAnimations(animations, modelRef);
  const [isVibrating, setIsVibrating] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY / 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    if (!modelRef.current) return;
    if (followCursor) {
      modelRef.current.rotation.y = state.mouse.x * Math.PI;
    }
    modelRef.current.position.y = scrollY - 1;
    modelRef.current.scale.set(scale, scale, scale);
    modelRef.current.position.set(...position);
    if (isVibrating) {
      modelRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.05;
    }
    if (isRotating) {
      modelRef.current.rotation.y += 0.1;
    }
  });

  const handleClick = () => {
    if (interactive === "vibrate") {
      setIsVibrating(true);
      setTimeout(() => setIsVibrating(false), 500);
    } else if (interactive === "rotate") {
      setIsRotating(true);
      setTimeout(() => setIsRotating(false), 1064);
    }
  };

  useEffect(() => {
    if (animations && actions) {
      actions[Object.keys(actions)[0]]?.play();
    }
  }, [actions]);

  return <primitive ref={modelRef} object={scene} onClick={handleClick} />;
};

// Section component with side text and animations
const Section = ({ id, title, description, modelProps, sideText }) => (
  <div id={id} className="section">
    <div className="content">
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="side-text">{sideText}</p>
    </div>
    <Canvas>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={1} />
        <Model {...modelProps} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Suspense>
    </Canvas>
  </div>
);

// Hero section with animation
const Hero = () => (
  <div className="hero">
    <h1>Welcome to AI Labs</h1>
    <p>Experience the future of interactive AI models.</p>
  </div>
);

// Navbar component
const Navbar = () => {
  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };
  return (
    <nav className="navbar">
      <img src="/logo.png" alt="Logo" className="logo" />
      <div className="nav-buttons">
        <button onClick={() => scrollToSection("section1")}>AI Robot</button>
        <button onClick={() => scrollToSection("section2")}>AI Assistant</button>
        <button onClick={() => scrollToSection("section3")}>Advanced AI</button>
      </div>
    </nav>
  );
};

// Main App component
const App = () => (
  <div>
    <Navbar />
    <Hero />
    <Section id="section1" title="Your AI Robot" description="Interact and chat with your AI companion." modelProps={{ path: "/cute_robot.glb", interactive: "vibrate", followCursor: true, scale: 0.8, position: [0, -1, 0] }} sideText="An advanced voice AI that understands and learns." />
    <Section id="section2" title="AI Assistant" description="An intelligent assistant to help you daily." modelProps={{ path: "/second_model.glb", interactive: "rotate", followCursor: false, scale: 1, position: [0, 0, 0] }} sideText="Assisting you with smart automation." />
    <Section id="section3" title="Advanced AI" description="A fully interactive AI with real-time animation." modelProps={{ path: "/animated_character.glb", interactive: "animate", followCursor: false, scale: 1.2, position: [0, -1, 0] }} sideText="Bringing AI intelligence to life." />
  </div>
);

export default App;
