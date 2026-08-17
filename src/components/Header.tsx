import Mark from './Mark';

export default function Header() {
  return (
    <header className="header">
      <div className="wrap header-inner">
        <a className="brand" href="#main">
          <Mark size={28} />
          <span className="brand-word">IRX</span>
        </a>
        <div className="header-right">
          <a className="header-link" href="#districts">Districts</a>
          <a className="header-link" href="#raise">Raise</a>
          <span className="header-domain">irx.world</span>
        </div>
      </div>
    </header>
  );
}
