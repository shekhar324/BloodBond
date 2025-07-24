"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function SplashScreen({ show }: { show: boolean }) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7 } }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "linear-gradient(135deg, #fff 60%, #fbe9e7 100%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 60 }}
            animate={{ scale: 1.1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, duration: 0.8 }}
            style={{ display: "flex", alignItems: "center", gap: 18 }}
          >
            <motion.span
              initial={{ rotate: -30, scale: 0.8 }}
              animate={{ rotate: [0, 20, -10, 0], scale: [0.8, 1.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{ fontSize: 64, color: "#e53935", filter: "drop-shadow(0 4px 16px #e5393533)" }}
            >
              🩸
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              style={{
                fontWeight: 900,
                fontSize: 38,
                letterSpacing: 1.5,
                color: "#7b3f8c",
                textShadow: "0 2px 12px #7b3f8c22",
                fontFamily: "inherit",
              }}
            >
              BloodBond
            </motion.span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            style={{
              marginTop: 24,
              fontSize: 18,
              color: "#b71c1c",
              fontWeight: 500,
              letterSpacing: 0.5,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            Save Lives. Connect. Donate. Make a Difference.
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 