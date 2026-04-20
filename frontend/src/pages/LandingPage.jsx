import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function LandingPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  return (
    <div style={{ fontFamily: "var(--font-sans, Inter, system-ui, Arial)", minHeight: "100vh", background: "#fbf6f0" }}>
      {/* Hero Section */}
      <section style={{ padding: "80px 40px", textAlign: "left", position: "relative", overflow: "hidden" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ 
              fontSize: "clamp(32px, 5vw, 56px)", 
              margin: 0, 
              color: "var(--color-primary)",
              lineHeight: 1.2,
              fontWeight: 800,
            }}
          >
            Aapke symptoms, ab samjhe jaayenge.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ 
              fontSize: "clamp(16px, 2vw, 20px)", 
              color: "#6b7280", 
              marginTop: 16,
              maxWidth: 600,
            }}
          >
            Thyroid, Anemia, PCOS – Indian women health insights in one simple app.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap" }}
          >
            <Link to="/signup" style={ctaPrimary}>Get Started Free →</Link>
            <Link to="/login" style={ctaSecondary}>Login</Link>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ position: "absolute", top: 20, right: 40, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)" }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{ position: "absolute", bottom: 40, left: 60, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)" }} 
        />
      </section>

      {/* Value Props - White Cards */}
      <section style={{ padding: "80px 40px", background: "#fef9f5" }}>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {[
            { icon: "🧠", title: "Understand Your Body", desc: "Know what your symptoms mean" },
            { icon: "💡", title: "Clarity, Not Confusion", desc: "Simple and easy explanations" },
            { icon: "🎯", title: "Take Better Decisions", desc: "Know your next steps clearly" },
            { icon: "💪", title: "Your Health, Your Control", desc: "Empower yourself with knowledge" },
          ].map((item, i) => (
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              style={{ 
                textAlign: "center",
                padding: 32,
                background: "white",
                borderRadius: 20,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)", marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>{item.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Simple Process */}
      <section style={{ padding: "80px 40px", textAlign: "left", background: "#fef9f5" }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div 
            variants={fadeInUp}
            style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", borderRadius: 999, background: "#fce7f3", color: "#db2777", fontWeight: 700, marginBottom: 20, fontSize: 14 }}
          >
            ⚡ SIMPLE PROCESS
          </motion.div>
          
          <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "var(--color-primary)", margin: "0 0 16px", fontWeight: 700 }}>
            4 aasaan steps mein apni health ka safar
          </motion.h2>
          
          <motion.p variants={fadeInUp} style={{ color: "#6b7280", maxWidth: 600, fontSize: 16 }}>
            Ko medical jargon nahi. Koi confusion nahi. Bas simple, caring guidance.
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 40 }}>
            {[
              { n: 1, title: "Apne symptoms batao", body: "Jo bhi feel ho raha hai — thakaan, baal girna, irregular periods, mood changes.", icon: "📝" },
              { n: 2, title: "Follow-up questions", body: "Hum aapke answers ke basis par smart questions pooche hain. Jaise — kitne time se?", icon: "💬" },
              { n: 3, title: "Lab report add karo", body: "Agar lab hai to report upload karo. Isse prediction aur behtar hogi.", icon: "🧪" },
              { n: 4, title: "Download Your Health Report", body: "Ek clinical-style PDF jo aap doctor ke saath share kar sakte ho.", icon: "📄" },
            ].map((c, i) => (
              <motion.div
                key={c.n}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                style={{ 
                  borderRadius: 20, 
                  padding: 32, 
                  background: "white", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)", 
                  position: "relative",
                  textAlign: "left",
                }}
              >
                <div style={{ 
                  position: "absolute", 
                  top: -16, 
                  left: 24, 
                  width: 36, 
                  height: 36, 
                  borderRadius: 12, 
                  background: "var(--color-primary)", 
                  color: "white", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontWeight: 800,
                  fontSize: 18,
                }}>{c.n}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
                <h3 style={{ margin: "8px 0 12px", color: "var(--color-primary)", fontSize: 18, fontWeight: 600 }}>{c.title}</h3>
                <p style={{ color: "#6b7280", margin: 0, lineHeight: 1.6, fontSize: 14 }}>{c.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

{/* Conditions Section - Light version */}
      <section style={{ padding: "80px 40px", background: "#fbf6f0" }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--color-primary)", margin: "0 0 16px", fontWeight: 700 }}>
            Hum detect karte hain
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ color: "#6b7280", maxWidth: 600, marginBottom: 40 }}>
            Ye conditions aapki symptoms ke basis par detect kiye jaate hain
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { title: "Hypothyroidism", subtitle: "Thyroid gland ki kami se hormonal imbalance", symptoms: ["Constant thakaan", "Weight gain", "cold intolerance"], color: "#ec4899" },
              { title: "Iron Deficiency Anemia", subtitle: "Khoon mein iron ki kami", symptoms: ["Fatigue", "Pale skin", "Shortness of breath"], color: "#f59e0b" },
              { title: "PCOS", subtitle: "Polycystic Ovary Syndrome", symptoms: ["Irregular periods", "Weight changes", "Acne"], color: "#8b5cf6" },
              { title: "Hyperthyroidism", subtitle: "Thyroid overactivity", symptoms: ["Weight loss", "Rapid heartbeat", "Anxiety"], color: "#06b6d4" },
            ].map((c, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                style={{ 
                  borderRadius: 16, 
                  padding: 24, 
                  background: "white", 
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ width: 8, height: 40, borderRadius: 4, background: c.color, marginBottom: 16 }} />
                <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 600, color: "var(--color-primary)" }}>{c.title}</h3>
                <p style={{ color: "#6b7280", margin: "0 0 16px", fontSize: 14 }}>{c.subtitle}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {c.symptoms.map((s, j) => (
                    <span key={j} style={{ 
                      padding: "4px 12px", 
                      background: "#f3f4f6", 
                      borderRadius: 999, 
                      fontSize: 12,
                      color: "#4b5563"
                    }}>{s}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* More conditions - simple text */}
          <motion.p variants={fadeInUp} style={{ marginTop: 32, color: "#6b7280", fontSize: 16 }}>
            Aur bhi conditions detect hote hain jaise{' '}
            <strong>Endometriosis, Menorrhagia, Amenorrhea, Uterine Fibroids, PMDD, Perimenopause, Vitamin Deficiencies (B Complex, D, Magnesium, Zinc), Insulin Resistance,</strong> aur bahut saare...
          </motion.p>
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: "80px 40px", textAlign: "left", background: "#fef9f5" }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--color-primary)", margin: "0 0 40px", fontWeight: 700 }}>
            Kyun choose karein?
          </motion.h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { icon: "📊", title: "Track", desc: "Apni health ko time par track karein" },
              { icon: "🧠", title: "Understand", desc: "Apne symptoms ko clearly samjhein" },
              { icon: "💪", title: "Improve", desc: "Right guidance se behtar feel karein" },
              { icon: "🔒", title: "100% Private", desc: "Aapka data humare paas surakshit hai" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                style={{ padding: 24, textAlign: "center" }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <h4 style={{ margin: "0 0 8px", color: "var(--color-primary)", fontSize: 18 }}>{item.title}</h4>
                <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section - Glassmorphism */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ 
          padding: "80px 40px", 
          textAlign: "left", 
          background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255,255,255,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--color-primary)", margin: "0 0 16px", fontWeight: 700 }}>
            Ab shuru karein?
          </h2>
          <p style={{ color: "#6b7280", maxWidth: 500, marginBottom: 32, fontSize: 16 }}>
            Bas 2 minute lagega. Koi credit card nahi, koi commitment nahi.
          </p>
          <Link to="/signup" style={ctaPrimary}>Start Free Screening Now →</Link>
        </div>
      </motion.section>
    </div>
  );
}

const ctaPrimary = {
  padding: "16px 32px",
  borderRadius: 999,
  background: "var(--color-primary)",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 16,
  display: "inline-block",
  transition: "transform 0.2s, box-shadow 0.2s",
  boxShadow: "0 4px 14px rgba(30, 58, 95, 0.3)",
};

const ctaSecondary = {
  padding: "16px 32px",
  borderRadius: 999,
  background: "transparent",
  color: "var(--color-primary)",
  border: "2px solid var(--color-primary)",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 16,
  display: "inline-block",
};