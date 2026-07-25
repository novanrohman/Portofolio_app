import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CvData, ExpItem } from "@/lib/cvData";

const styles = StyleSheet.create({
  page: {
    paddingVertical: 44,
    paddingHorizontal: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#222222",
    lineHeight: 1.45,
  },

  // Header
  header: { borderBottomWidth: 1.5, borderBottomColor: "#222222", paddingBottom: 12, marginBottom: 2 },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", lineHeight: 1.2, marginBottom: 4 },
  title: { fontSize: 11, color: "#444444", lineHeight: 1.2, marginBottom: 6 },
  contact: { fontSize: 8.5, color: "#555555", lineHeight: 1.4, marginTop: 2 },

  // Sections
  section: { marginTop: 16 },
  heading: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
    color: "#222222",
    borderBottomWidth: 0.75,
    borderBottomColor: "#cccccc",
    paddingBottom: 3,
    marginBottom: 8,
  },
  para: { color: "#333333", textAlign: "justify" },

  // Items
  item: { marginBottom: 9 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, flex: 1, paddingRight: 8 },
  itemPeriod: { fontSize: 9, color: "#666666" },
  itemRole: { fontSize: 9.5, color: "#555555", fontFamily: "Helvetica-Oblique", marginTop: 1 },
  itemDesc: { color: "#333333", marginTop: 2 },

  // Skills / bullets
  bulletRow: { flexDirection: "row", marginBottom: 3 },
  bulletDot: { width: 12, fontFamily: "Helvetica-Bold" },
  bulletText: { flex: 1, color: "#333333" },
});

function ExperienceBlock({ items }: { items: ExpItem[] }) {
  return (
    <>
      {items.map((e, i) => {
        const heading = e.title || e.role || "";
        const sub = e.title && e.role ? e.role : "";
        return (
          <View key={i} style={styles.item} wrap={false}>
            <View style={styles.itemRow}>
              <Text style={styles.itemTitle}>{heading}</Text>
              {e.period ? <Text style={styles.itemPeriod}>{e.period}</Text> : null}
            </View>
            {sub ? <Text style={styles.itemRole}>{sub}</Text> : null}
            {e.description ? <Text style={styles.itemDesc}>{e.description}</Text> : null}
          </View>
        );
      })}
    </>
  );
}

export default function CvDocument({ data }: { data: CvData }) {
  const { profile, summary, skills, experience, organization, education, certificates, contact } = data;
  const contactLine = [profile.email, profile.phone, profile.location].filter(Boolean).join("    |    ");
  const links = contact
    .map((c) => c.href?.replace(/^https?:\/\/(www\.)?/, ""))
    .filter(Boolean)
    .join("    |    ");

  return (
    <Document author={profile.name} title={`CV - ${profile.name ?? ""}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name || "Your Name"}</Text>
          {profile.title ? <Text style={styles.title}>{profile.title}</Text> : null}
          {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}
          {links ? <Text style={styles.contact}>{links}</Text> : null}
        </View>

        {summary ? (
          <View style={styles.section}>
            <Text style={styles.heading}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.para}>{summary}</Text>
          </View>
        ) : null}

        {skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>SKILLS</Text>
            <Text style={styles.para}>{skills.join("  •  ")}</Text>
          </View>
        ) : null}

        {experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>WORK EXPERIENCE</Text>
            <ExperienceBlock items={experience} />
          </View>
        ) : null}

        {organization.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>ORGANIZATIONAL EXPERIENCE</Text>
            <ExperienceBlock items={organization} />
          </View>
        ) : null}

        {education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>EDUCATION</Text>
            {education.map((e, i) => (
              <View key={i} style={styles.item} wrap={false}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>{e.title}</Text>
                  {e.period ? <Text style={styles.itemPeriod}>{e.period}</Text> : null}
                </View>
                {e.role ? <Text style={styles.itemRole}>{e.role}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {certificates.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>CERTIFICATIONS</Text>
            {certificates.map((c, i) => (
              <View key={i} style={styles.bulletRow} wrap={false}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{c.title}</Text>
                  {c.description ? ` — ${c.description}` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
