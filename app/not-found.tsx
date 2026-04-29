import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { image } from "@/data/site";

export default function NotFound() {
  return (
    <div className="elite-page elite-not-found-route">
      <section className="elite-not-found page-shell">
        <div className="elite-not-found__type" aria-hidden="true">
          404
        </div>
        <figure className="elite-not-found__portrait" aria-hidden="true">
          <Image src={image.portrait} width={1586} height={992} alt="" priority sizes="min(92vw, 680px)" />
        </figure>
        <div className="elite-not-found__copy">
          <p className="elite-kicker">Oops, something went wrong</p>
          <h1>Page not found</h1>
          <p>The route you opened is not part of the new build.</p>
          <div className="elite-not-found__actions">
            <Link className="elite-pill elite-pill--light" href="/" data-cursor="HOME">
              Go back home
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a className="elite-pill" href="#contact" data-cursor="CONTACT">
              Contact
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
