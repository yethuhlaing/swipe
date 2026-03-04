import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of Service for our application",
}

export default function TermsOfService() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="mb-8">
                <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    &larr; Back to Home
                </Link>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        1. Acceptance of Terms
                    </h2>
                    <p className="mb-4">
                        By accessing and using this service, you accept and agree to be
                        bound by the terms and provision of this agreement. If you do
                        not agree to abide by the above, please do not use this service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        2. Use License
                    </h2>
                    <p className="mb-4">
                        Permission is granted to temporarily access the materials
                        (information or software) on our service for personal,
                        non-commercial transitory viewing only. This is the grant of a
                        license, not a transfer of title, and under this license you may
                        not:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Modify or copy the materials</li>
                        <li>
                            Use the materials for any commercial purpose, or for any
                            public display (commercial or non-commercial)
                        </li>
                        <li>
                            Attempt to decompile or reverse engineer any software
                            contained on our service
                        </li>
                        <li>
                            Remove any copyright or other proprietary notations from the
                            materials
                        </li>
                        <li>
                            Transfer the materials to another person or mirror the
                            materials on any other server
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
                    <p className="mb-4">
                        The materials on our service are provided on an as is basis. We
                        make no warranties, expressed or implied, and hereby disclaim and
                        negate all other warranties including, without limitation,
                        implied warranties or conditions of merchantability, fitness for
                        a particular purpose, or non-infringement of intellectual
                        property or other violation of rights.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
                    <p className="mb-4">
                        In no event shall our company or its suppliers be liable for any
                        damages (including, without limitation, damages for loss of data
                        or profit, or due to business interruption) arising out of the
                        use or inability to use the materials on our service, even if we
                        or our authorized representative has been notified orally or in
                        writing of the possibility of such damage.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        5. Accuracy of Materials
                    </h2>
                    <p className="mb-4">
                        The materials appearing on our service could include technical,
                        typographical, or photographic errors. We do not warrant that any
                        of the materials on our service are accurate, complete or
                        current. We may make changes to the materials contained on our
                        service at any time without notice.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Links</h2>
                    <p className="mb-4">
                        We have not reviewed all of the sites linked to our service and
                        are not responsible for the contents of any such linked site. The
                        inclusion of any link does not imply endorsement by us of the
                        site. Use of any such linked website is at the users own risk.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        7. Modifications
                    </h2>
                    <p className="mb-4">
                        We may revise these terms of service for our service at any time
                        without notice. By using this service you are agreeing to be
                        bound by the then current version of these terms of service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        8. Governing Law
                    </h2>
                    <p className="mb-4">
                        These terms and conditions are governed by and construed in
                        accordance with the laws and you irrevocably submit to the
                        exclusive jurisdiction of the courts in that location.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                    <p className="mb-4">
                        If you have any questions about these Terms of Service, please
                        contact us at support@example.com.
                    </p>
                </section>
            </div>
        </div>
    )
}
