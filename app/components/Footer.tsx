export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-white/60">
          © {new Date().getFullYear()} Novan Rohman. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
