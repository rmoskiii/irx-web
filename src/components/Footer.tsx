export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>IRX · irx.world</span>
        <a href="mailto:rmagnus98@gmail.com">rmagnus98@gmail.com</a>
        <span>&copy; {year}</span>
      </div>
    </footer>
  );
}
