import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import { ArrowRightIcon, Clock, Layers, Layers2 } from "lucide-react";
import { Button } from "components/ui/Button";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="home">
      <Navbar />
      <section className="hero">
        <div className="annouce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing room</p>
        </div>
        <h1>Build beautiful spaces at the speed of thought</h1>
        <p className="subtitle">Room is an AI platform for architects and designers to create and share their work</p>
        <div className="actions">
          <a href="#upload" className="cta">Start Building <ArrowRightIcon className="icon" /></a>
          <Button variant="outline" size="lg" className="demo">Watch demo</Button>

        </div>
        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon"></Layers>
              </div>
              <h3>Upload your floor plan</h3>
              <p>suport JPG, PNG, formats up to 10MB</p>
            </div>
            <p>Upload images</p>
          </div>

        </div>

      </section>
      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Explore our collection of projects</p>
            </div>
          </div>
          <div className="projects-grid">
            <div className="project-card group">
              <div className="preview">
                <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png" alt="Project" />
                <div className="badge">
                  <span>Community</span>
                </div>
              </div>
              <div className="card-body">
                <div>
                  <h3>Project Manhattan</h3>
                  <div className="meta">
                    <Clock size={16} />
                    <span>{new Date("2026-01-01").toLocaleDateString()}</span>
                    <span>by John</span>
                  </div>
                </div>
                <div className="arrow">
                  <ArrowRightIcon size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
