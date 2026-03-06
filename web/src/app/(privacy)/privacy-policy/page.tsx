import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for our application",
}

export default function PrivacyPolicy() {
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
                <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                    <p className="mb-4">
                        Welcome to our Privacy Policy. Your privacy is critically
                        important to us. This Privacy Policy document contains types of
                        information that is collected and recorded by our service and how
                        we use it.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        2. Information We Collect
                    </h2>
                    <p className="mb-4">
                        We collect several different types of information for various
                        purposes to provide and improve our service to you.
                    </p>
                    <h3 className="text-xl font-semibold mb-3 mt-4">
                        Personal Data
                    </h3>
                    <p className="mb-4">
                        While using our service, we may ask you to provide us with
                        certain personally identifiable information that can be used to
                        contact or identify you. This may include, but is not limited to:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Phone number</li>
                        <li>Address, State, Province, ZIP/Postal code, City</li>
                        <li>Cookies and Usage Data</li>
                    </ul>
                    <h3 className="text-xl font-semibold mb-3 mt-4">Usage Data</h3>
                    <p className="mb-4">
                        We may also collect information on how the service is accessed
                        and used. This Usage Data may include information such as your
                        computers Internet Protocol address (e.g. IP address), browser
                        type, browser version, the pages of our service that you visit,
                        the time and date of your visit, the time spent on those pages,
                        and other diagnostic data.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        3. How We Use Your Information
                    </h2>
                    <p className="mb-4">
                        We use the collected data for various purposes:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>To provide and maintain our service</li>
                        <li>To notify you about changes to our service</li>
                        <li>
                            To allow you to participate in interactive features of our
                            service when you choose to do so
                        </li>
                        <li>To provide customer support</li>
                        <li>
                            To gather analysis or valuable information so that we can
                            improve our service
                        </li>
                        <li>To monitor the usage of our service</li>
                        <li>To detect, prevent and address technical issues</li>
                        <li>
                            To provide you with news, special offers and general
                            information about other goods, services and events which we
                            offer
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        4. Data Retention
                    </h2>
                    <p className="mb-4">
                        We will retain your Personal Data only for as long as is
                        necessary for the purposes set out in this Privacy Policy. We
                        will retain and use your Personal Data to the extent necessary to
                        comply with our legal obligations, resolve disputes, and enforce
                        our legal agreements and policies.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        5. Transfer of Data
                    </h2>
                    <p className="mb-4">
                        Your information, including Personal Data, may be transferred to
                        and maintained on computers located outside of your state,
                        province, country or other governmental jurisdiction where the
                        data protection laws may differ from those of your jurisdiction.
                    </p>
                    <p className="mb-4">
                        We will take all steps reasonably necessary to ensure that your
                        data is treated securely and in accordance with this Privacy
                        Policy.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        6. Disclosure of Data
                    </h2>
                    <p className="mb-4">
                        We may disclose your Personal Data in the good faith belief that
                        such action is necessary to:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Comply with a legal obligation</li>
                        <li>Protect and defend our rights or property</li>
                        <li>
                            Prevent or investigate possible wrongdoing in connection with
                            the service
                        </li>
                        <li>
                            Protect the personal safety of users of the service or the
                            public
                        </li>
                        <li>Protect against legal liability</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        7. Security of Data
                    </h2>
                    <p className="mb-4">
                        The security of your data is important to us but remember that no
                        method of transmission over the Internet or method of electronic
                        storage is 100% secure. While we strive to use commercially
                        acceptable means to protect your Personal Data, we cannot
                        guarantee its absolute security.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        8. Service Providers
                    </h2>
                    <p className="mb-4">
                        We may employ third party companies and individuals to facilitate
                        our service, to provide the service on our behalf, to perform
                        service-related services or to assist us in analyzing how our
                        service is used.
                    </p>
                    <p className="mb-4">
                        These third parties have access to your Personal Data only to
                        perform these tasks on our behalf and are obligated not to
                        disclose or use it for any other purpose.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        9. Links to Other Sites
                    </h2>
                    <p className="mb-4">
                        Our service may contain links to other sites that are not
                        operated by us. If you click on a third party link, you will be
                        directed to that third partys site. We strongly advise you to
                        review the Privacy Policy of every site you visit.
                    </p>
                    <p className="mb-4">
                        We have no control over and assume no responsibility for the
                        content, privacy policies or practices of any third party sites
                        or services.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        10. Childrens Privacy
                    </h2>
                    <p className="mb-4">
                        Our service does not address anyone under the age of 18. We do
                        not knowingly collect personally identifiable information from
                        anyone under the age of 18. If you are a parent or guardian and
                        you are aware that your child has provided us with Personal Data,
                        please contact us.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        11. Changes to This Privacy Policy
                    </h2>
                    <p className="mb-4">
                        We may update our Privacy Policy from time to time. We will
                        notify you of any changes by posting the new Privacy Policy on
                        this page and updating the Last updated date at the top of this
                        Privacy Policy.
                    </p>
                    <p className="mb-4">
                        You are advised to review this Privacy Policy periodically for
                        any changes. Changes to this Privacy Policy are effective when
                        they are posted on this page.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">12. Your Rights</h2>
                    <p className="mb-4">
                        Depending on your location, you may have certain rights regarding
                        your personal data:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>The right to access your personal data</li>
                        <li>The right to rectification of inaccurate personal data</li>
                        <li>The right to erasure of your personal data</li>
                        <li>The right to restrict processing of your personal data</li>
                        <li>The right to data portability</li>
                        <li>The right to object to processing of your personal data</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
                    <p className="mb-4">
                        If you have any questions about this Privacy Policy, please
                        contact us:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>By email: privacy@example.com</li>
                        <li>By visiting this page on our website: [contact page URL]</li>
                    </ul>
                </section>
            </div>
        </div>
    )
}
