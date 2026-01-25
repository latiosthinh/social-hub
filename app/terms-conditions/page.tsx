export default function TermsConditions() {
    return (
        <div className="max-w-4xl mx-auto p-6 pb-32 min-h-screen">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Terms and Conditions</h1>
                <p className="text-white/50">Last updated: {new Date().toLocaleDateString()}</p>
            </header>

            <div className="space-y-8 text-white/80 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">1. Introduction</h2>
                    <p>
                        Welcome to SocialHub. These Terms and Conditions govern your use of our website and services.
                        By accessing or using SocialHub, you agree to be bound by these Terms. If you disagree with any part of these terms,
                        you may not access the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">2. User Responsibilities</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password.
                        You agree to accept responsibility for all activities that occur under your account or password.
                        You must not use our service for any illegal or unauthorized purpose.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">3. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of SocialHub and its licensors.
                        Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of SocialHub.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">4. Termination</h2>
                    <p>
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever,
                        including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">5. Limitation of Liability</h2>
                    <p>
                        In no event shall SocialHub, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental,
                        special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                        resulting from your access to or use of or inability to access or use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">6. Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which SocialHub operates,
                        without regard to its conflict of law provisions.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">7. Changes</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                        What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective,
                        you agree to be bound by the revised terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">8. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at: <br />
                        <a href="mailto:support@socialhub.xueer.space" className="text-blue-400 hover:text-blue-300">support@socialhub.xueer.space</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
