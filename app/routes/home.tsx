
import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import { ArrowRightIcon, Clock } from "lucide-react";
import { Button } from "components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { createProject, getProject } from "lib/puter.action";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        console.log("Home: Fetching projects...");
        const data = await getProject("");
        console.log("Home: Projects received:", data);
        setProjects(data || []);
      } catch (err) {
        console.error("Home: Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const isCreatingprojectRef = useRef(false);

  const handleUploadcomplete = async (base64Image: string) => {
    try {
      if (isCreatingprojectRef.current) return;
      isCreatingprojectRef.current = true;

      const newId = Date.now().toString();
      const name = `Residence ${newId}`;
      const newItem: DesignItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        timestamp: Date.now()
      }
      let saved: DesignItem | null | undefined;
      try {
        console.log("Home: Creating project...");
        saved = await createProject({ item: newItem, visibility: 'private' });
      } catch (err) {
        console.error("Home: failed to create project", err);
      }

      const projectData = saved || newItem;

      setProjects((prev: DesignItem[]) => [projectData, ...prev]);

      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage: projectData.sourceImage,
          initialRender: projectData.renderedImage || null,
          name
        }
      });
    }
    finally {
      isCreatingprojectRef.current = false;
    }

  }

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
          <Upload onComplete={handleUploadcomplete} />
        </div>



      </section >
      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Explore our collection of projects</p>
            </div>
          </div>
          <div className="projects-grid">
            {loading ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                Loading your projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                No projects found. Start building to see them here!
              </div>
            ) : projects.map(({ id, name, renderedImage, sourceImage, timestamp }: DesignItem) => (
              <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)} style={{ cursor: 'pointer' }}>
                <div className="preview">
                  <img src={renderedImage || sourceImage} alt="Project" />
                  <div className="badge">
                    <span>Community</span>
                  </div>
                </div>
                <div className="card-body">
                  <div>
                    <h3>{name}</h3>
                    <div className="meta">
                      <Clock size={16} />
                      <span>{timestamp ? new Date(timestamp).toLocaleDateString() : 'Recent'}</span>
                      <span>by You</span>
                    </div>
                  </div>
                  <div className="arrow">
                    <ArrowRightIcon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div >
  );
}
