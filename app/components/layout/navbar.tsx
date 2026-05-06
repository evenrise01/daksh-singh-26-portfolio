import React from 'react'
import Link from "next/link";
import Lottie from "lottie-react";
const navbar = () => {
    return (
        <>
            <ul role="list" className="nav-menu-mobile">
                <li><Link href="/" className="nav-link-mobile is-green">About</Link></li>
                <li><Link href="/" className="w-inline-block w--current">
                    <div className="ds-icon" data-w-id="91904852-ecd5-72e8-91db-717a7b7fdb92" data-animation-type="lottie" data-src="documents/icon-jm.json" data-loop="0" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="0" data-duration="2.8" data-loading="eager">
                        {/* <Lottie
              src="/documents/icon-jm.json"
              autoplay={true}
              loop={true}
              style={{ width: '100%', height: '100%' }} animationData={undefined}              
            /> */}
                    </div>
                </Link></li>
                <li><Link href="/work" className="nav-link-mobile is-green">Work</Link></li>
            </ul>
            <div className="container-2">
                <div className="cont-name-logo">
                    <Link href="/" className="nav-name w-inline-block w--current">
                        <div className="nav-name-ds is-green">Daksh</div>
                        <div className="dot-jm"></div>
                        <div className="nav-name-ds is-green">Singh</div>
                    </Link>
                </div>
                <ul role="list" className="nav-menu w-list-unstyled">
                    <li className="cont-social-link">
                        <Link href="/about" className="nav-link is-green">
                            About
                        </Link>
                    </li>
                    <li><Link href="/" className="w-inline-block w--current">
                        <div className="ds-icon" data-w-id="91904852-ecd5-72e8-91db-717a7b7fdb92" data-animation-type="lottie" data-src="documents/icon-jm.json" data-loop="0" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="0" data-duration="2.8" data-loading="eager">
                            {/* <Lottie
              src="/documents/icon-jm.json"
              autoplay={true}
              loop={true}
              style={{ width: '100%', height: '100%' }} animationData={undefined}              
            /> */}
                            DS
                        </div>
                    </Link></li>
                    <li className="cont-social-link">
                        <Link href="/work" className="nav-link is-green">
                            Work
                        </Link>
                    </li>
                </ul>
                <ol role="list" className="nav-social-wrapper w-list-unstyled">
                    <li className="cont-social-link"><a href="mailto:[EMAIL_ADDRESS]?subject=Hey%20Daksh%20Singh!" className="nav-social-link is-green">Email</a></li>
                    <li className="cont-social-link"><a href="#" target="_blank" className="nav-social-link is-green">in</a></li>
                    <li className="cont-social-link"><a href="#" target="_blank" className="nav-social-link is-green">X</a></li>
                    <li className="cont-social-link"><a href="#" target="_blank" className="nav-social-link is-green">Github</a></li>
                </ol>
            </div>
        </>
    )
}

export default navbar