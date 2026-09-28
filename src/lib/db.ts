import { supabase } from "./supabase";
import path from "path";

// ─── Notices ──────────────────────────────────────────────────────────────
export interface Notice {
  id: number;
  title: string;
  date: string;
  dateISO: string;
  type: string;
  fileUrl: string | null;
  isNew: boolean;
  addedBy?: string;
}

export const noticesDB = {
  getAll: async (): Promise<Notice[]> => {
    const { data } = await supabase.from('notices').select('*').order('id', { ascending: false });
    const internalTypes = new Set(['routine', 'slider', 'gallery', 'staff', 'calendar', 'result', 'committee', 'school_info']);
    return (data || [])
      .filter(n => !internalTypes.has(n.type))
      .map(n => ({
        id: n.id, title: n.title, date: n.date, dateISO: n.date_iso, type: n.type, fileUrl: n.file_url, isNew: n.is_new, addedBy: n.added_by
      }));
  },
  add: async (notice: Omit<Notice, "id"> & { id?: number }) => {
    const noticeId = notice.id || (Date.now() % 2147483647);
    const { data, error } = await supabase.from('notices').insert({
      id: noticeId,
      title: notice.title,
      date: notice.date,
      date_iso: notice.dateISO,
      type: notice.type,
      file_url: notice.fileUrl,
      is_new: notice.isNew,
      added_by: notice.addedBy
    }).select().single();
    if (error) throw error;
    return { ...data, dateISO: data.date_iso, fileUrl: data.file_url, isNew: data.is_new, addedBy: data.added_by };
  },
  update: async (id: number, data: Partial<Notice>) => {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.fileUrl !== undefined) updateData.file_url = data.fileUrl;
    if (data.isNew !== undefined) updateData.is_new = data.isNew;
    await supabase.from('notices').update(updateData).eq('id', id);
  },
  delete: async (id: number) => {
    await supabase.from('notices').delete().eq('id', id);
  },
};

// ─── Teachers ─────────────────────────────────────────────────────────────
export interface Teacher {
  id: number;
  nameBengali: string;
  nameEnglish: string;
  designation: string;
  designationEn: string;
  subject: string;
  category: "management" | "faculty";
  photo: string;
  order: number;
  // Extended profile fields
  mpoIndex?: string;
  joiningDate?: string;
  birthDate?: string;
  fatherName?: string;
  motherName?: string;
  email?: string;
  contactNo?: string;
  qualification?: string;
  experience?: string;
  interest?: string;
  presentAddress?: string;
  permanentAddress?: string;
}

export const teachersDB = {
  getAll: async (): Promise<Teacher[]> => {
    const { data } = await supabase.from('teachers').select('*').order('sort_order', { ascending: true });
    return (data || []).map(t => ({
      id: t.id, nameBengali: t.name_bengali, nameEnglish: t.name_english, designation: t.designation, designationEn: t.designation_en, subject: t.subject, category: t.category, photo: t.photo, order: t.sort_order,
      mpoIndex: t.mpo_index, joiningDate: t.joining_date, birthDate: t.birth_date, fatherName: t.father_name, motherName: t.mother_name, email: t.email, contactNo: t.contact_no, qualification: t.qualification, experience: t.experience, interest: t.interest, presentAddress: t.present_address, permanentAddress: t.permanent_address
    }));
  },
  add: async (teacher: Omit<Teacher, "id">) => {
    const { data, error } = await supabase.from('teachers').insert({
      name_bengali: teacher.nameBengali, name_english: teacher.nameEnglish, designation: teacher.designation, designation_en: teacher.designationEn, subject: teacher.subject, category: teacher.category, photo: teacher.photo, sort_order: teacher.order,
      mpo_index: teacher.mpoIndex, joining_date: teacher.joiningDate, birth_date: teacher.birthDate, father_name: teacher.fatherName, mother_name: teacher.motherName, email: teacher.email, contact_no: teacher.contactNo, qualification: teacher.qualification, experience: teacher.experience, interest: teacher.interest, present_address: teacher.presentAddress, permanent_address: teacher.permanentAddress
    }).select().single();
    if (error) throw error;
    return { ...data, nameBengali: data.name_bengali, nameEnglish: data.name_english, designationEn: data.designation_en, order: data.sort_order };
  },
  update: async (id: number, data: Partial<Teacher>) => {
    const updateData: any = {};
    if (data.nameBengali !== undefined) updateData.name_bengali = data.nameBengali;
    if (data.nameEnglish !== undefined) updateData.name_english = data.nameEnglish;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.designationEn !== undefined) updateData.designation_en = data.designationEn;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.order !== undefined) updateData.sort_order = data.order;
    if (data.mpoIndex !== undefined) updateData.mpo_index = data.mpoIndex;
    if (data.joiningDate !== undefined) updateData.joining_date = data.joiningDate;
    if (data.birthDate !== undefined) updateData.birth_date = data.birthDate;
    if (data.fatherName !== undefined) updateData.father_name = data.fatherName;
    if (data.motherName !== undefined) updateData.mother_name = data.motherName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.contactNo !== undefined) updateData.contact_no = data.contactNo;
    if (data.qualification !== undefined) updateData.qualification = data.qualification;
    if (data.experience !== undefined) updateData.experience = data.experience;
    if (data.interest !== undefined) updateData.interest = data.interest;
    if (data.presentAddress !== undefined) updateData.present_address = data.presentAddress;
    if (data.permanentAddress !== undefined) updateData.permanent_address = data.permanentAddress;
    await supabase.from('teachers').update(updateData).eq('id', id);
  },
  delete: async (id: number) => {
    await supabase.from('teachers').delete().eq('id', id);
  },
};


// ─── Staff ────────────────────────────────────────────────────────────────
export interface Staff {
  id: number;
  nameBengali: string;
  nameEnglish: string;
  designation: string;
  designationEn: string;
  phone?: string;
  photo?: string;
  order: number;
}

const staffJsonPath = path.join(process.cwd(), "src", "data", "staff.json");

async function readLocalStaff(): Promise<Staff[]> {
  try {
    const fs = await import("fs/promises");
    const content = await fs.readFile(staffJsonPath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

async function writeLocalStaff(data: Staff[]) {
  try {
    const fs = await import("fs/promises");
    await fs.writeFile(staffJsonPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Local staff write error:", e);
  }
}

export const staffDB = {
  getAll: async (): Promise<Staff[]> => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('type', 'staff')
        .order('id', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((s: any) => {
          let extra: any = {};
          try { extra = JSON.parse(s.added_by || "{}"); } catch (e) {}
          return {
            id: s.id,
            nameBengali: s.title,
            nameEnglish: extra.nameEnglish || "",
            designation: s.date,
            designationEn: extra.designationEn || "",
            phone: s.date_iso || "",
            photo: s.file_url || "",
            order: typeof extra.order === "number" ? extra.order : 0
          };
        }).sort((a, b) => a.order - b.order);
      }
    } catch (e) {}
    const local = await readLocalStaff();
    return local.sort((a, b) => a.order - b.order);
  },
  add: async (item: Omit<Staff, "id">): Promise<Staff> => {
    const local = await readLocalStaff();
    const newId = (Date.now() % 2147483647);
    const newStaff: Staff = {
      id: newId,
      nameBengali: item.nameBengali,
      nameEnglish: item.nameEnglish || "",
      designation: item.designation,
      designationEn: item.designationEn || "",
      phone: item.phone || "",
      photo: item.photo || "",
      order: item.order || local.length + 1
    };

    try {
      await supabase.from('notices').insert({
        id: newId,
        title: item.nameBengali,
        date: item.designation,
        date_iso: item.phone || "",
        file_url: item.photo || "",
        type: 'staff',
        added_by: JSON.stringify({
          nameEnglish: item.nameEnglish,
          designationEn: item.designationEn,
          order: newStaff.order
        }),
        is_new: false
      });
    } catch (e) {}

    local.push(newStaff);
    await writeLocalStaff(local);
    return newStaff;
  },
  update: async (id: number, data: Partial<Staff>) => {
    try {
      const updateData: any = {};
      if (data.nameBengali !== undefined) updateData.title = data.nameBengali;
      if (data.designation !== undefined) updateData.date = data.designation;
      if (data.phone !== undefined) updateData.date_iso = data.phone;
      if (data.photo !== undefined) updateData.file_url = data.photo;
      if (data.nameEnglish !== undefined || data.designationEn !== undefined || data.order !== undefined) {
        updateData.added_by = JSON.stringify({
          nameEnglish: data.nameEnglish,
          designationEn: data.designationEn,
          order: data.order
        });
      }
      await supabase.from('notices').update(updateData).eq('id', id).eq('type', 'staff');
    } catch (e) {}

    const local = await readLocalStaff();
    const index = local.findIndex((s: Staff) => s.id === id);
    if (index !== -1) {
      local[index] = { ...local[index], ...data };
      await writeLocalStaff(local);
    }
  },
  delete: async (id: number) => {
    try {
      await supabase.from('notices').delete().eq('id', id).eq('type', 'staff');
    } catch (e) {}
    const local = await readLocalStaff();
    const filtered = local.filter((s: Staff) => s.id !== id);
    await writeLocalStaff(filtered);
  },
};


// ─── Alumni ───────────────────────────────────────────────────────────────
export interface Alumni {
  id: number;
  nameBengali: string;
  nameEnglish: string;
  institution: string;
  degree: string;
  photo: string;
  year: string | null;
}

export const alumniDB = {
  getAll: async (): Promise<Alumni[]> => {
    const { data } = await supabase.from('alumni').select('*').order('id', { ascending: false });
    return (data || []).map(a => ({
      id: a.id, nameBengali: a.name_bengali, nameEnglish: a.name_english, institution: a.institution, degree: a.degree, photo: a.photo, year: a.passing_year
    }));
  },
  add: async (alumni: Omit<Alumni, "id">) => {
    const { data, error } = await supabase.from('alumni').insert({
      name_bengali: alumni.nameBengali, name_english: alumni.nameEnglish, institution: alumni.institution, degree: alumni.degree, photo: alumni.photo, passing_year: alumni.year
    }).select().single();
    if (error) throw error;
    return { ...data, nameBengali: data.name_bengali, nameEnglish: data.name_english, year: data.passing_year };
  },
  update: async (id: number, data: Partial<Alumni>) => {
    const updateData: any = {};
    if (data.nameBengali !== undefined) updateData.name_bengali = data.nameBengali;
    if (data.nameEnglish !== undefined) updateData.name_english = data.nameEnglish;
    if (data.institution !== undefined) updateData.institution = data.institution;
    if (data.degree !== undefined) updateData.degree = data.degree;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.year !== undefined) updateData.passing_year = data.year;
    await supabase.from('alumni').update(updateData).eq('id', id);
  },
  delete: async (id: number) => {
    await supabase.from('alumni').delete().eq('id', id);
  },
};

// ─── Gallery ──────────────────────────────────────────────────────────────
export interface GalleryPhoto {
  id: number;
  src: string;
  caption: string;
  category: string;
}

export const galleryDB = {
  getAll: async (): Promise<GalleryPhoto[]> => {
    try {
      const { data } = await supabase.from('notices').select('*').eq('type', 'gallery').order('id', { ascending: false });
      if (data && data.length > 0) {
        return data.map((g: any) => ({
          id: g.id,
          src: g.file_url,
          caption: g.title,
          category: g.added_by || "campus"
        }));
      }
    } catch (e) {}
    try {
      const fs = await import("fs/promises");
      const p = await import("path");
      const content = await fs.readFile(p.join(process.cwd(), "src", "data", "gallery.json"), "utf-8");
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  },
  add: async (photo: Omit<GalleryPhoto, "id"> & { id?: number }) => {
    const photoId = photo.id || (Date.now() % 2147483647);
    const { data, error } = await supabase.from('notices').insert({
      id: photoId,
      title: photo.caption,
      file_url: photo.src,
      type: 'gallery',
      added_by: photo.category || 'campus',
      date: new Date().toLocaleDateString('bn-BD'),
      date_iso: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return {
      id: data.id,
      src: data.file_url,
      caption: data.title,
      category: data.added_by
    };
  },
  delete: async (id: number) => {
    await supabase.from('notices').delete().eq('id', id).eq('type', 'gallery');
  },
};

// ─── Users ────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  username: string;
  passwordHash: string;
  role: "admin" | "teacher" | "student";
  teacherId?: number;
  class?: string;
  active: boolean;
}

export const usersDB = {
  getAll: async (): Promise<User[]> => {
    const { data } = await supabase.from('users').select('*').order('id', { ascending: true });
    return (data || []).map(u => ({
      id: u.id, name: u.name, username: u.username, passwordHash: u.password_hash, role: u.role, teacherId: u.teacher_id, class: u.class, active: u.active
    }));
  },
  findByUsername: async (username: string): Promise<User | null> => {
    const { data } = await supabase.from('users').select('*').eq('username', username).eq('active', true).maybeSingle();
    if (!data) return null;
    return {
      id: data.id, name: data.name, username: data.username, passwordHash: data.password_hash, role: data.role, teacherId: data.teacher_id, class: data.class, active: data.active
    };
  },
  add: async (user: Omit<User, "id">) => {
    const { data, error } = await supabase.from('users').insert({
      name: user.name, username: user.username, password_hash: user.passwordHash, role: user.role, teacher_id: user.teacherId, class: user.class, active: user.active
    }).select().single();
    if (error) throw error;
    return { ...data, passwordHash: data.password_hash, teacherId: data.teacher_id, class: data.class };
  },
  update: async (id: number, data: Partial<User>) => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.teacherId !== undefined) updateData.teacher_id = data.teacherId;
    if (data.class !== undefined) updateData.class = data.class;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.passwordHash !== undefined) updateData.password_hash = data.passwordHash;
    await supabase.from('users').update(updateData).eq('id', id);
  },
  delete: async (id: number) => {
    await supabase.from('users').update({ active: false }).eq('id', id);
  },
};

