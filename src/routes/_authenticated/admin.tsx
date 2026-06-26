import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCardMedia } from "@/components/ProjectCardMedia";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit2,
  ExternalLink,
  FileDown,
  FileText,
  ImageIcon,
  LogOut,
  Plus,
  Trash2,
  Upload,
  UserCircle,
} from "lucide-react";
import {
  convertSupabaseProjects,
  parseProjectTechnologies,
  readProjectImageFile,
  readStoredPortfolioProjects,
  saveStoredPortfolioProjects,
  type StoredPortfolioProject,
} from "@/lib/local-projects";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Manage Portfolio" }] }),
  component: AdminPage,
});

type Certificate = {
  id: string;
  title: string;
  institution: string;
  date_issued: string;
  description: string | null;
  file_url: string;
  file_path: string;
  file_type: string;
  created_at: string;
};

type SiteAsset = {
  key: string;
  file_path: string;
  file_url: string;
  file_type: string;
  updated_at: string;
};

type HomeContent = {
  id: string;
  name: string;
  title: string;
  tagline: string;
  summary: string;
};

type AboutContent = {
  id: string;
  personal_background: string;
  professional_background: string;
  vision: string;
  mission: string;
  career_goals: string;
  interests: string;
};

type Education = {
  id: string;
  institution: string;
  field_of_study: string;
  degree: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number;
};

type Experience = {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
  display_order: number;
};

type Project = StoredPortfolioProject;

type ContactInfo = {
  id: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
};

type FooterContent = {
  id: string;
  copyright_text: string;
};

const CERT_ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const CERT_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "webp"];
const PROFILE_ACCEPTED = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const PROJECT_IMAGE_ACCEPTED = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getSafeFileName(fileName: string) {
  const ext = getFileExtension(fileName);
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return `${baseName || "certificate"}-${crypto.randomUUID()}.${ext}`;
}

function isAcceptedCertificateFile(file: File) {
  const ext = getFileExtension(file.name);
  return CERT_EXTENSIONS.includes(ext) && CERT_ACCEPTED.includes(file.type);
}

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("files");

  // Home Content
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [homeName, setHomeName] = useState("");
  const [homeTitle, setHomeTitle] = useState("");
  const [homeTagline, setHomeTagline] = useState("");
  const [homeSummary, setHomeSummary] = useState("");
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeMsg, setHomeMsg] = useState<string | null>(null);

  // About Content
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [aboutPersonal, setAboutPersonal] = useState("");
  const [aboutProfessional, setAboutProfessional] = useState("");
  const [aboutVision, setAboutVision] = useState("");
  const [aboutMission, setAboutMission] = useState("");
  const [aboutGoals, setAboutGoals] = useState("");
  const [aboutInterests, setAboutInterests] = useState("");
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutMsg, setAboutMsg] = useState<string | null>(null);

  // Education
  const [education, setEducation] = useState<Education[]>([]);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduInstitution, setEduInstitution] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduStart, setEduStart] = useState("");
  const [eduEnd, setEduEnd] = useState("");
  const [eduDesc, setEduDesc] = useState("");
  const [eduLoading, setEduLoading] = useState(false);
  const [eduMsg, setEduMsg] = useState<string | null>(null);

  // Experience
  const [experience, setExperience] = useState<Experience[]>([]);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expLoading, setExpLoading] = useState(false);
  const [expMsg, setExpMsg] = useState<string | null>(null);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projLink, setProjLink] = useState("");
  const [projFile, setProjFile] = useState<File | null>(null);
  const [projFileInputKey, setProjFileInputKey] = useState(0);
  const [projLoading, setProjLoading] = useState(false);
  const [projMsg, setProjMsg] = useState<string | null>(null);

  // Contact Info
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactLinkedin, setContactLinkedin] = useState("");
  const [contactGithub, setContactGithub] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMsg, setContactMsg] = useState<string | null>(null);

  // Footer Content
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);
  const [footerCopyright, setFooterCopyright] = useState("");
  const [footerLoading, setFooterLoading] = useState(false);
  const [footerMsg, setFooterMsg] = useState<string | null>(null);

  // Certificates
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [certTitle, setCertTitle] = useState("");
  const [certInstitution, setCertInstitution] = useState("");
  const [certDateIssued, setCertDateIssued] = useState("");
  const [certDescription, setCertDescription] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certFileInputKey, setCertFileInputKey] = useState(0);
  const [certPreviewUrl, setCertPreviewUrl] = useState<string | null>(null);
  const [certUploading, setCertUploading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [certMessage, setCertMessage] = useState<string | null>(null);

  // Profile + CV
  const [profileAsset, setProfileAsset] = useState<SiteAsset | null>(null);
  const [profileSignedUrl, setProfileSignedUrl] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [cvAsset, setCvAsset] = useState<SiteAsset | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvMsg, setCvMsg] = useState<string | null>(null);
  const [cvErr, setCvErr] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      setIsAdmin(Boolean(data));
    })();
    loadAllData();
  }, []);

  // Handle cert preview
  useEffect(() => {
    if (!certFile) {
      setCertPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(certFile);
    setCertPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [certFile]);

  // Handle profile preview
  useEffect(() => {
    if (!profileFile) {
      setProfilePreview(null);
      return;
    }
    const url = URL.createObjectURL(profileFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  async function loadAllData() {
    await Promise.all([
      loadHomeContent(),
      loadAboutContent(),
      loadEducation(),
      loadExperience(),
      loadProjects(),
      loadContactInfo(),
      loadFooterContent(),
      loadCertificates(),
      loadAssets(),
    ]);
  }

  async function loadHomeContent() {
    const { data } = await supabase.from("home_content").select("*").limit(1);
    if (data && data.length > 0) {
      const item = data[0];
      setHomeContent(item);
      setHomeName(item.name);
      setHomeTitle(item.title);
      setHomeTagline(item.tagline);
      setHomeSummary(item.summary);
    }
  }

  async function loadAboutContent() {
    const { data } = await supabase.from("about_content").select("*").limit(1);
    if (data && data.length > 0) {
      const item = data[0];
      setAboutContent(item);
      setAboutPersonal(item.personal_background);
      setAboutProfessional(item.professional_background);
      setAboutVision(item.vision);
      setAboutMission(item.mission);
      setAboutGoals(item.career_goals);
      setAboutInterests(item.interests);
    }
  }

  async function loadEducation() {
    const { data } = await supabase.from("education").select("*").order("display_order");
    setEducation((data as Education[]) ?? []);
  }

  async function loadExperience() {
    const { data } = await supabase.from("experience").select("*").order("display_order");
    setExperience((data as Experience[]) ?? []);
  }

  async function loadProjects() {
    const storedProjects = readStoredPortfolioProjects();
    if (storedProjects !== null) {
      setProjects(storedProjects);
      return;
    }

    const { data } = await supabase.from("projects").select("*").order("display_order");
    const initialProjects = convertSupabaseProjects(data ?? []);
    saveStoredPortfolioProjects(initialProjects);
    setProjects(initialProjects);
  }

  async function loadContactInfo() {
    const { data } = await supabase.from("contact_info").select("*").limit(1);
    if (data && data.length > 0) {
      const item = data[0];
      setContactInfo(item);
      setContactEmail(item.email);
      setContactPhone(item.phone || "");
      setContactLinkedin(item.linkedin || "");
      setContactGithub(item.github || "");
    }
  }

  async function loadFooterContent() {
    const { data } = await supabase.from("footer_content").select("*").limit(1);
    if (data && data.length > 0) {
      const item = data[0];
      setFooterContent(item);
      setFooterCopyright(item.copyright_text);
    }
  }

  async function loadCertificates() {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .order("date_issued", { ascending: false });
    setCerts((data as Certificate[]) ?? []);
  }

  async function loadAssets() {
    const { data } = await supabase.from("site_assets").select("*");
    const list = (data as SiteAsset[]) ?? [];
    const p = list.find((a) => a.key === "profile_image") ?? null;
    const c = list.find((a) => a.key === "cv") ?? null;
    setProfileAsset(p);
    setCvAsset(c);
    if (p) {
      const { data: signed } = await supabase.storage
        .from("profile-images")
        .createSignedUrl(p.file_path, 3600);
      setProfileSignedUrl(signed?.signedUrl ?? null);
    }
  }

  // HOME CONTENT
  async function saveHomeContent() {
    setHomeLoading(true);
    setHomeMsg(null);
    try {
      if (homeContent) {
        await supabase
          .from("home_content")
          .update({
            name: homeName,
            title: homeTitle,
            tagline: homeTagline,
            summary: homeSummary,
          })
          .eq("id", homeContent.id);
      } else {
        await supabase.from("home_content").insert({
          name: homeName,
          title: homeTitle,
          tagline: homeTagline,
          summary: homeSummary,
        });
      }
      setHomeMsg("Home content updated!");
      await loadHomeContent();
    } catch (err) {
      setHomeMsg("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setHomeLoading(false);
    }
  }

  // ABOUT CONTENT
  async function saveAboutContent() {
    setAboutLoading(true);
    setAboutMsg(null);
    try {
      if (aboutContent) {
        await supabase
          .from("about_content")
          .update({
            personal_background: aboutPersonal,
            professional_background: aboutProfessional,
            vision: aboutVision,
            mission: aboutMission,
            career_goals: aboutGoals,
            interests: aboutInterests,
          })
          .eq("id", aboutContent.id);
      } else {
        await supabase.from("about_content").insert({
          personal_background: aboutPersonal,
          professional_background: aboutProfessional,
          vision: aboutVision,
          mission: aboutMission,
          career_goals: aboutGoals,
          interests: aboutInterests,
        });
      }
      setAboutMsg("About content updated!");
      await loadAboutContent();
    } catch (err) {
      setAboutMsg("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setAboutLoading(false);
    }
  }

  // EDUCATION
  async function addEducation(e: React.FormEvent) {
    e.preventDefault();
    setEduLoading(true);
    setEduMsg(null);
    try {
      if (editingEduId) {
        // Update existing
        await supabase
          .from("education")
          .update({
            institution: eduInstitution,
            field_of_study: eduField,
            degree: eduDegree,
            start_date: eduStart || null,
            end_date: eduEnd || null,
            description: eduDesc || null,
          })
          .eq("id", editingEduId);
        setEduMsg("Education updated!");
      } else {
        // Add new
        const order =
          education.length > 0 ? Math.max(...education.map((e) => e.display_order)) + 1 : 0;
        await supabase.from("education").insert({
          institution: eduInstitution,
          field_of_study: eduField,
          degree: eduDegree,
          start_date: eduStart || null,
          end_date: eduEnd || null,
          description: eduDesc || null,
          display_order: order,
        });
        setEduMsg("Education added!");
      }
      clearEduForm();
      await loadEducation();
    } catch (err) {
      setEduMsg("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setEduLoading(false);
    }
  }

  function loadEducationForEdit(edu: Education) {
    setEditingEduId(edu.id);
    setEduInstitution(edu.institution);
    setEduField(edu.field_of_study);
    setEduDegree(edu.degree);
    setEduStart(edu.start_date || "");
    setEduEnd(edu.end_date || "");
    setEduDesc(edu.description || "");
    setEduMsg(null);
  }

  function clearEduForm() {
    setEditingEduId(null);
    setEduInstitution("");
    setEduField("");
    setEduDegree("");
    setEduStart("");
    setEduEnd("");
    setEduDesc("");
    setEduMsg(null);
  }

  async function deleteEducation(id: string) {
    if (!confirm("Delete this education record?")) return;
    await supabase.from("education").delete().eq("id", id);
    if (editingEduId === id) clearEduForm();
    await loadEducation();
  }

  // EXPERIENCE
  async function addExperience(e: React.FormEvent) {
    e.preventDefault();
    setExpLoading(true);
    setExpMsg(null);
    try {
      if (editingExpId) {
        // Update existing
        await supabase
          .from("experience")
          .update({
            title: expTitle,
            company: expCompany,
            start_date: expStart,
            end_date: expEnd || null,
            description: expDesc,
          })
          .eq("id", editingExpId);
        setExpMsg("Experience updated!");
      } else {
        // Add new
        const order =
          experience.length > 0 ? Math.max(...experience.map((e) => e.display_order)) + 1 : 0;
        await supabase.from("experience").insert({
          title: expTitle,
          company: expCompany,
          start_date: expStart,
          end_date: expEnd || null,
          description: expDesc,
          display_order: order,
        });
        setExpMsg("Experience added!");
      }
      clearExpForm();
      await loadExperience();
    } catch (err) {
      setExpMsg("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setExpLoading(false);
    }
  }

  function loadExperienceForEdit(exp: Experience) {
    setEditingExpId(exp.id);
    setExpTitle(exp.title);
    setExpCompany(exp.company);
    setExpStart(exp.start_date);
    setExpEnd(exp.end_date || "");
    setExpDesc(exp.description);
    setExpMsg(null);
  }

  function clearExpForm() {
    setEditingExpId(null);
    setExpTitle("");
    setExpCompany("");
    setExpStart("");
    setExpEnd("");
    setExpDesc("");
    setExpMsg(null);
  }

  async function deleteExperience(id: string) {
    if (!confirm("Delete this experience record?")) return;
    await supabase.from("experience").delete().eq("id", id);
    if (editingExpId === id) clearExpForm();
    await loadExperience();
  }

  // PROJECTS
  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    setProjLoading(true);
    setProjMsg(null);
    try {
      const title = projTitle.trim();
      const description = projDesc.trim();
      const projectLink = projLink.trim();

      if (!title || !description) {
        setProjMsg("Error: Missing required fields");
        return;
      }

      if (projectLink) {
        try {
          new URL(projectLink);
        } catch {
          setProjMsg("Error: Project link must be a valid URL");
          return;
        }
      }

      if (projFile && !PROJECT_IMAGE_ACCEPTED.includes(projFile.type)) {
        setProjMsg("Error: Invalid image upload");
        return;
      }

      const existingProj = editingProjId
        ? projects.find((project) => project.id === editingProjId)
        : null;
      const imageUrl = projFile
        ? await readProjectImageFile(projFile)
        : existingProj?.imageUrl || "";
      const nextProject: Project = {
        id: editingProjId ?? crypto.randomUUID(),
        title,
        description,
        technologies: parseProjectTechnologies(projTech),
        projectLink,
        imageUrl,
        createdAt: existingProj?.createdAt ?? new Date().toISOString(),
      };

      let nextProjects: Project[];
      if (editingProjId) {
        if (!existingProj) {
          setProjMsg("Error: Failed save operation");
          return;
        }
        nextProjects = projects.map((project) =>
          project.id === editingProjId ? nextProject : project,
        );
      } else {
        nextProjects = [nextProject, ...projects];
      }

      saveStoredPortfolioProjects(nextProjects);
      setProjects(nextProjects);
      clearProjForm();
      setProjMsg(editingProjId ? "Project updated successfully" : "Project added successfully");
    } catch (err) {
      setProjMsg("Error: " + (err instanceof Error ? err.message : "Failed save operation"));
    } finally {
      setProjLoading(false);
    }
  }

  function loadProjectForEdit(proj: Project) {
    setEditingProjId(proj.id);
    setProjTitle(proj.title);
    setProjDesc(proj.description);
    setProjTech(proj.technologies.join(", "));
    setProjLink(proj.projectLink);
    setProjFile(null);
    setProjMsg(null);
    setProjFileInputKey((key) => key + 1);
  }

  function clearProjForm() {
    setEditingProjId(null);
    setProjTitle("");
    setProjDesc("");
    setProjTech("");
    setProjLink("");
    setProjFile(null);
    setProjMsg(null);
    setProjFileInputKey((key) => key + 1);
  }

  function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const nextProjects = projects.filter((project) => project.id !== id);
    saveStoredPortfolioProjects(nextProjects);
    setProjects(nextProjects);
    if (editingProjId === id) clearProjForm();
    setProjMsg("Project deleted successfully");
  }

  // CONTACT INFO
  async function saveContactInfo() {
    setContactLoading(true);
    setContactMsg(null);
    try {
      if (contactInfo) {
        await supabase
          .from("contact_info")
          .update({
            email: contactEmail,
            phone: contactPhone || null,
            linkedin: contactLinkedin || null,
            github: contactGithub || null,
          })
          .eq("id", contactInfo.id);
      } else {
        await supabase.from("contact_info").insert({
          email: contactEmail,
          phone: contactPhone || null,
          linkedin: contactLinkedin || null,
          github: contactGithub || null,
        });
      }
      setContactMsg("Contact info updated!");
      await loadContactInfo();
    } catch (err) {
      setContactMsg("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setContactLoading(false);
    }
  }

  async function saveFooterContent() {
    setFooterLoading(true);
    setFooterMsg(null);
    try {
      if (footerContent) {
        await supabase
          .from("footer_content")
          .update({
            copyright_text: footerCopyright,
          })
          .eq("id", footerContent.id);
      } else {
        await supabase.from("footer_content").insert({
          copyright_text: footerCopyright,
        });
      }
      setFooterMsg("Footer content updated!");
      await loadFooterContent();
    } catch (err) {
      setFooterMsg("Error: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setFooterLoading(false);
    }
  }

  // CERTIFICATES
  async function uploadCertificate(e: React.FormEvent) {
    e.preventDefault();
    setCertError(null);
    setCertMessage(null);
    if (!certFile) {
      setCertError("Please choose a file.");
      return;
    }
    if (!isAcceptedCertificateFile(certFile)) {
      setCertError("Please upload a PDF, PNG, JPG, JPEG, or WEBP certificate.");
      return;
    }
    setCertUploading(true);
    try {
      const path = getSafeFileName(certFile.name);
      const { error: upErr } = await supabase.storage.from("certificates").upload(path, certFile, {
        cacheControl: "31536000",
        contentType: certFile.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(path);
      const { error: insertErr } = await supabase.from("certificates").insert({
        title: certTitle,
        institution: certInstitution,
        date_issued: certDateIssued,
        description: certDescription || null,
        file_url: urlData.publicUrl,
        file_path: path,
        file_type: certFile.type,
      });
      if (insertErr) throw insertErr;
      setCertMessage("Certificate uploaded!");
      setCertTitle("");
      setCertInstitution("");
      setCertDateIssued("");
      setCertDescription("");
      setCertFile(null);
      setCertFileInputKey((key) => key + 1);
      await loadCertificates();
    } catch (err) {
      setCertError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setCertUploading(false);
    }
  }

  async function deleteCertificate(cert: Certificate) {
    if (!confirm(`Delete "${cert.title}"?`)) return;
    await supabase.storage.from("certificates").remove([cert.file_path]);
    await supabase.from("certificates").delete().eq("id", cert.id);
    await loadCertificates();
  }

  // PROFILE UPLOAD
  async function uploadProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    if (!profileFile) {
      setProfileErr("Please choose an image.");
      return;
    }
    setProfileUploading(true);
    try {
      if (profileAsset) {
        await supabase.storage.from("profile-images").remove([profileAsset.file_path]);
      }
      const ext = profileFile.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("profile-images")
        .upload(path, profileFile);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(path);
      await supabase.from("site_assets").upsert({
        key: "profile_image",
        file_path: path,
        file_url: urlData.publicUrl,
        file_type: profileFile.type,
      });
      setProfileMsg("Profile image updated!");
      setProfileFile(null);
      await loadAssets();
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProfileUploading(false);
    }
  }

  // CV UPLOAD
  async function uploadCv(e: React.FormEvent) {
    e.preventDefault();
    setCvErr(null);
    setCvMsg(null);
    if (!cvFile) {
      setCvErr("Please choose a PDF.");
      return;
    }
    setCvUploading(true);
    try {
      if (cvAsset) {
        await supabase.storage.from("cv").remove([cvAsset.file_path]);
      }
      const path = `Simanye_Tevin_Sizini_CV-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("cv").upload(path, cvFile);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("cv").getPublicUrl(path);
      await supabase.from("site_assets").upsert({
        key: "cv",
        file_path: path,
        file_url: urlData.publicUrl,
        file_type: "application/pdf",
      });
      setCvMsg("CV updated!");
      setCvFile(null);
      await loadAssets();
    } catch (err) {
      setCvErr(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setCvUploading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isAdmin === false) {
    return (
      <SiteLayout>
        <Container className="max-w-xl">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h1 className="text-xl font-semibold">Not authorized</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account does not have admin privileges. Contact the portfolio owner.
            </p>
            <Button onClick={handleSignOut} variant="outline" className="mt-5">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </Container>
      </SiteLayout>
    );
  }

  if (isAdmin === null) return <div>Loading...</div>;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="Manage Portfolio"
        description="Manage all portfolio content. Changes appear instantly on the public site."
      />
      <Container>
        <div className="mb-6 flex justify-end">
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          {/* FILES TAB */}
          <TabsContent value="files" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <form
                onSubmit={uploadProfile}
                className="space-y-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Profile Picture</h2>
                </div>
                <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-surface">
                  {profilePreview ? (
                    <img src={profilePreview} alt="New" className="h-full w-full object-cover" />
                  ) : profileSignedUrl ? (
                    <img
                      src={profileSignedUrl}
                      alt="Current"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="profile-file">Upload image (JPG, PNG, WEBP · max 5MB)</Label>
                  <Input
                    id="profile-file"
                    type="file"
                    accept={PROJECT_IMAGE_ACCEPTED.join(",")}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && !PROFILE_ACCEPTED.includes(f.type)) {
                        setProfileErr("Only JPG, PNG, or WEBP accepted.");
                        return;
                      }
                      setProfileFile(f || null);
                    }}
                    className="mt-1.5"
                  />
                </div>
                {profileErr && <p className="text-sm text-destructive">{profileErr}</p>}
                {profileMsg && <p className="text-sm text-primary">{profileMsg}</p>}
                <Button
                  type="submit"
                  disabled={profileUploading || !profileFile}
                  className="w-full"
                >
                  <Upload className="h-4 w-4" /> {profileUploading ? "Uploading…" : "Save Profile"}
                </Button>
              </form>

              <form
                onSubmit={uploadCv}
                className="space-y-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-2">
                  <FileDown className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Curriculum Vitae</h2>
                </div>
                <div className="rounded-md border border-border bg-surface p-3 text-sm">
                  {cvAsset ? (
                    <div>
                      <span className="text-muted-foreground">
                        Updated: {new Date(cvAsset.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No CV uploaded yet.</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="cv-file">Upload PDF (max 10MB)</Label>
                  <Input
                    id="cv-file"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && f.type !== "application/pdf") {
                        setCvErr("Only PDF files accepted.");
                        return;
                      }
                      setCvFile(f || null);
                    }}
                    className="mt-1.5"
                  />
                </div>
                {cvErr && <p className="text-sm text-destructive">{cvErr}</p>}
                {cvMsg && <p className="text-sm text-primary">{cvMsg}</p>}
                <Button type="submit" disabled={cvUploading || !cvFile} className="w-full">
                  <Upload className="h-4 w-4" /> {cvUploading ? "Uploading…" : "Save CV"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* HOME TAB */}
          <TabsContent value="home">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveHomeContent();
              }}
              className="space-y-4 rounded-xl border border-border bg-card p-6 max-w-2xl"
            >
              <h2 className="text-lg font-semibold">Home Page Content</h2>
              <div>
                <Label htmlFor="home-name">Name</Label>
                <Input
                  id="home-name"
                  value={homeName}
                  onChange={(e) => setHomeName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="home-title">Professional Title</Label>
                <Input
                  id="home-title"
                  value={homeTitle}
                  onChange={(e) => setHomeTitle(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="home-tagline">Tagline</Label>
                <Input
                  id="home-tagline"
                  value={homeTagline}
                  onChange={(e) => setHomeTagline(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="home-summary">Summary</Label>
                <Textarea
                  id="home-summary"
                  value={homeSummary}
                  onChange={(e) => setHomeSummary(e.target.value)}
                  className="mt-1.5 min-h-24"
                />
              </div>
              {homeMsg && <p className="text-sm text-primary">{homeMsg}</p>}
              <Button type="submit" disabled={homeLoading}>
                Save Home Content
              </Button>
            </form>
          </TabsContent>

          {/* ABOUT TAB */}
          <TabsContent value="about">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveAboutContent();
              }}
              className="space-y-4 rounded-xl border border-border bg-card p-6 max-w-2xl"
            >
              <h2 className="text-lg font-semibold">About Page Content</h2>
              <div>
                <Label htmlFor="about-personal">Personal Background</Label>
                <Textarea
                  id="about-personal"
                  value={aboutPersonal}
                  onChange={(e) => setAboutPersonal(e.target.value)}
                  className="mt-1.5 min-h-24"
                />
              </div>
              <div>
                <Label htmlFor="about-professional">Professional Background</Label>
                <Textarea
                  id="about-professional"
                  value={aboutProfessional}
                  onChange={(e) => setAboutProfessional(e.target.value)}
                  className="mt-1.5 min-h-24"
                />
              </div>
              <div>
                <Label htmlFor="about-vision">Vision</Label>
                <Textarea
                  id="about-vision"
                  value={aboutVision}
                  onChange={(e) => setAboutVision(e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>
              <div>
                <Label htmlFor="about-mission">Mission</Label>
                <Textarea
                  id="about-mission"
                  value={aboutMission}
                  onChange={(e) => setAboutMission(e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>
              <div>
                <Label htmlFor="about-goals">Career Goals</Label>
                <Textarea
                  id="about-goals"
                  value={aboutGoals}
                  onChange={(e) => setAboutGoals(e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>
              <div>
                <Label htmlFor="about-interests">Interests</Label>
                <Textarea
                  id="about-interests"
                  value={aboutInterests}
                  onChange={(e) => setAboutInterests(e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>
              {aboutMsg && <p className="text-sm text-primary">{aboutMsg}</p>}
              <Button type="submit" disabled={aboutLoading}>
                Save About Content
              </Button>
            </form>
          </TabsContent>

          {/* EDUCATION TAB */}
          <TabsContent value="education" className="space-y-6">
            <form
              onSubmit={addEducation}
              className="space-y-4 rounded-xl border border-border bg-card p-6 max-w-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingEduId ? "Edit Education" : "Add Education"}
                </h2>
                {editingEduId && (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    Editing
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="edu-institution">Institution</Label>
                <Input
                  id="edu-institution"
                  required
                  value={eduInstitution}
                  onChange={(e) => setEduInstitution(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edu-field">Field of Study</Label>
                <Input
                  id="edu-field"
                  required
                  value={eduField}
                  onChange={(e) => setEduField(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edu-degree">Degree/Qualification</Label>
                <Input
                  id="edu-degree"
                  required
                  value={eduDegree}
                  onChange={(e) => setEduDegree(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edu-start">Start Date</Label>
                  <Input
                    id="edu-start"
                    type="date"
                    value={eduStart}
                    onChange={(e) => setEduStart(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="edu-end">End Date (Optional)</Label>
                  <Input
                    id="edu-end"
                    type="date"
                    value={eduEnd}
                    onChange={(e) => setEduEnd(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edu-desc">Description (Optional)</Label>
                <Textarea
                  id="edu-desc"
                  value={eduDesc}
                  onChange={(e) => setEduDesc(e.target.value)}
                  className="mt-1.5 min-h-20"
                />
              </div>
              {eduMsg && <p className="text-sm text-primary">{eduMsg}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={eduLoading} className="flex-1">
                  <Plus className="h-4 w-4" /> {editingEduId ? "Update Education" : "Add Education"}
                </Button>
                {editingEduId && (
                  <Button type="button" onClick={clearEduForm} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-semibold">Education Records ({education.length})</h3>
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className={`flex items-start justify-between gap-3 rounded-xl border p-4 ${editingEduId === edu.id ? "border-primary bg-card/50 ring-1 ring-primary" : "border-border bg-card"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {edu.degree} in {edu.field_of_study}
                    </p>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground">
                      {edu.start_date ? new Date(edu.start_date).toLocaleDateString() : "N/A"}
                      {edu.end_date ? ` – ${new Date(edu.end_date).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => loadEducationForEdit(edu)}
                      variant="ghost"
                      size="icon"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      onClick={() => deleteEducation(edu.id)}
                      variant="ghost"
                      size="icon"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* EXPERIENCE TAB */}
          <TabsContent value="experience" className="space-y-6">
            <form
              onSubmit={addExperience}
              className="space-y-4 rounded-xl border border-border bg-card p-6 max-w-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingExpId ? "Edit Experience" : "Add Experience"}
                </h2>
                {editingExpId && (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    Editing
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="exp-title">Job Title</Label>
                <Input
                  id="exp-title"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="exp-company">Company</Label>
                <Input
                  id="exp-company"
                  required
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exp-start">Start Date</Label>
                  <Input
                    id="exp-start"
                    type="date"
                    required
                    value={expStart}
                    onChange={(e) => setExpStart(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="exp-end">End Date (Optional)</Label>
                  <Input
                    id="exp-end"
                    type="date"
                    value={expEnd}
                    onChange={(e) => setExpEnd(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="exp-desc">Description</Label>
                <Textarea
                  id="exp-desc"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="mt-1.5 min-h-24"
                />
              </div>
              {expMsg && <p className="text-sm text-primary">{expMsg}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={expLoading} className="flex-1">
                  <Plus className="h-4 w-4" />{" "}
                  {editingExpId ? "Update Experience" : "Add Experience"}
                </Button>
                {editingExpId && (
                  <Button type="button" onClick={clearExpForm} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-semibold">Experience Records ({experience.length})</h3>
              {experience.map((exp) => (
                <div
                  key={exp.id}
                  className={`flex items-start justify-between gap-3 rounded-xl border p-4 ${editingExpId === exp.id ? "border-primary bg-card/50 ring-1 ring-primary" : "border-border bg-card"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{exp.title}</p>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exp.start_date).toLocaleDateString()} –{" "}
                      {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : "Present"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => loadExperienceForEdit(exp)}
                      variant="ghost"
                      size="icon"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      onClick={() => deleteExperience(exp.id)}
                      variant="ghost"
                      size="icon"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* PROJECTS TAB */}
          <TabsContent value="projects" className="space-y-6">
            <form
              onSubmit={addProject}
              className="space-y-4 rounded-xl border border-border bg-card p-6 max-w-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingProjId ? "Edit Project" : "Add Project"}
                </h2>
                {editingProjId && (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    Editing
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="proj-title">Project Title</Label>
                <Input
                  id="proj-title"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="proj-desc">Description</Label>
                <Textarea
                  id="proj-desc"
                  required
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="mt-1.5 min-h-24"
                />
              </div>
              <div>
                <Label htmlFor="proj-tech">Technologies (comma-separated, optional)</Label>
                <Input
                  id="proj-tech"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  className="mt-1.5"
                  placeholder="React, TypeScript, Tailwind"
                />
              </div>
              <div>
                <Label htmlFor="proj-link">Project Link (optional)</Label>
                <Input
                  id="proj-link"
                  type="url"
                  value={projLink}
                  onChange={(e) => setProjLink(e.target.value)}
                  className="mt-1.5"
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="proj-image">Project Image (optional)</Label>
                <Input
                  key={projFileInputKey}
                  id="proj-image"
                  type="file"
                  accept={PROJECT_IMAGE_ACCEPTED.join(",")}
                  onChange={(e) => setProjFile(e.target.files?.[0] || null)}
                  className="mt-1.5"
                />
                {editingProjId &&
                  projects.find((p) => p.id === editingProjId)?.imageUrl &&
                  !projFile && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Current image exists. Upload new to replace.
                    </p>
                  )}
              </div>
              {projMsg && (
                <p
                  className={`text-sm ${projMsg.startsWith("Error:") ? "text-destructive" : "text-primary"}`}
                >
                  {projMsg}
                </p>
              )}
              <div className="flex gap-3">
                <Button type="submit" disabled={projLoading} className="flex-1">
                  <Plus className="h-4 w-4" /> {editingProjId ? "Update Project" : "Add Project"}
                </Button>
                {editingProjId && (
                  <Button
                    type="button"
                    onClick={clearProjForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="font-semibold">Projects List ({projects.length})</h3>
              {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  No projects saved yet. Add a project above to display it here.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {projects.map((proj) => (
                    <article
                      key={proj.id}
                      className={`overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        editingProjId === proj.id
                          ? "border-primary ring-1 ring-primary"
                          : "border-border"
                      }`}
                    >
                      <ProjectCardMedia imageUrl={proj.imageUrl} title={proj.title} />
                      <div className="space-y-4 p-5">
                        <div>
                          <h4 className="text-base font-semibold">{proj.title}</h4>
                          <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
                            {proj.description}
                          </p>
                        </div>

                        {proj.technologies.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {proj.technologies.map((technology) => (
                              <span
                                key={technology}
                                className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                              >
                                {technology}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                          {proj.projectLink ? (
                            <Button asChild size="sm">
                              <a href={proj.projectLink} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Project
                              </a>
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            onClick={() => loadProjectForEdit(proj)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            onClick={() => deleteProject(proj.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* CONTACT TAB */}
          <TabsContent value="contact">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveContactInfo();
              }}
              className="space-y-4 rounded-xl border border-border bg-card p-6 max-w-2xl"
            >
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone (optional)</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact-linkedin">LinkedIn URL (optional)</Label>
                <Input
                  id="contact-linkedin"
                  type="url"
                  value={contactLinkedin}
                  onChange={(e) => setContactLinkedin(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact-github">GitHub URL (optional)</Label>
                <Input
                  id="contact-github"
                  type="url"
                  value={contactGithub}
                  onChange={(e) => setContactGithub(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              {contactMsg && <p className="text-sm text-primary">{contactMsg}</p>}
              <Button type="submit" disabled={contactLoading}>
                Save Contact Info
              </Button>
            </form>
          </TabsContent>

          {/* FOOTER TAB */}
          <TabsContent value="footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveFooterContent();
              }}
              className="space-y-4 rounded-xl border border-border bg-card p-6 max-w-2xl"
            >
              <h2 className="text-lg font-semibold">Footer Content</h2>
              <div>
                <Label htmlFor="footer-copyright">Copyright Text</Label>
                <Textarea
                  id="footer-copyright"
                  value={footerCopyright}
                  onChange={(e) => setFooterCopyright(e.target.value)}
                  className="mt-1.5 min-h-24"
                />
              </div>
              {footerMsg && <p className="text-sm text-primary">{footerMsg}</p>}
              <Button type="submit" disabled={footerLoading}>
                Save Footer Content
              </Button>
            </form>
          </TabsContent>

          {/* CERTIFICATES TAB */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <form
                onSubmit={uploadCertificate}
                className="space-y-4 rounded-xl border border-border bg-card p-6"
              >
                <h2 className="text-lg font-semibold">Upload Certificate</h2>
                <div>
                  <Label htmlFor="cert-title">Certificate Title</Label>
                  <Input
                    id="cert-title"
                    required
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-institution">Institution</Label>
                  <Input
                    id="cert-institution"
                    required
                    value={certInstitution}
                    onChange={(e) => setCertInstitution(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-date">Date Issued</Label>
                  <Input
                    id="cert-date"
                    type="date"
                    required
                    value={certDateIssued}
                    onChange={(e) => setCertDateIssued(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-desc">Description (optional)</Label>
                  <Textarea
                    id="cert-desc"
                    value={certDescription}
                    onChange={(e) => setCertDescription(e.target.value)}
                    className="mt-1.5 min-h-20"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-file">Certificate File (PDF, PNG, JPG, JPEG, WEBP)</Label>
                  <Input
                    key={certFileInputKey}
                    id="cert-file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                    className="mt-1.5"
                  />
                </div>
                {certPreviewUrl && certFile && (
                  <div className="rounded-md border border-border bg-surface p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">PREVIEW</p>
                    {certFile.type === "application/pdf" ? (
                      <iframe
                        src={certPreviewUrl}
                        title="Preview"
                        className="h-64 w-full rounded"
                      />
                    ) : (
                      <img
                        src={certPreviewUrl}
                        alt="Preview"
                        className="max-h-64 rounded object-contain"
                      />
                    )}
                  </div>
                )}
                {certError && <p className="text-sm text-destructive">{certError}</p>}
                {certMessage && <p className="text-sm text-primary">{certMessage}</p>}
                <Button type="submit" disabled={certUploading} className="w-full">
                  <Upload className="h-4 w-4" />{" "}
                  {certUploading ? "Uploading…" : "Upload Certificate"}
                </Button>
              </form>

              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Certificates ({certs.length})</h2>
                {certs.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                      {c.file_type === "application/pdf" ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.institution} · {new Date(c.date_issued).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                          <a href={c.file_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <a href={c.file_url} download>
                            <FileDown className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                    <Button onClick={() => deleteCertificate(c)} variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Container>
    </SiteLayout>
  );
}
