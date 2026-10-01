import { Logo, navigation } from "./Header";
import { company, services } from "../lib/company";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Logo />
          <p>
            Specialisti in nuove costruzioni, ristrutturazioni e restauri a
            Saronno e provincia. Costruiamo, ristrutturiamo e valorizziamo i
            tuoi spazi.
          </p>
          <div className="social-links">
            {company.socials.map(([label, url, icon]) => (
              <a
                key={label}
                href={url}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3>Menu</h3>
          {navigation.map(([label, id]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
        <div>
          <h3>I nostri servizi</h3>
          {services.map((service, i) => (
            <a key={service.title} href={`#service-${i}`}>
              {service.title}
            </a>
          ))}
        </div>
        <div>
          <h3>Contatti</h3>
          <a className="footer-phone" href={company.phoneHref}>
            {company.phone}
          </a>
          <a href={company.mobileHref}>{company.mobile}</a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <p>{company.address}</p>
          <p>
            {company.hours}
            <br />
            Sab – Dom: chiuso
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {company.name}
        </p>
        <div>
          <a href="/admin">Area riservata</a>
          <a href={company.privacy} target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          <span>P.IVA {company.vat}</span>
        </div>
      </div>
    </footer>
  );
}
