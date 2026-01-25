
export function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto p-6 pb-32">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                <p className="text-white/50">Last updated: {new Date().toLocaleDateString()}</p>
            </header>

            <div className="space-y-8 text-white/80 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">1. Introduction</h2>
                    <p>
                        Welcome to SocialHub. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights and how the law protects you.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">2. Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                        <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                        <li><strong>Profile Data:</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">3. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">5. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact us at: <br />
                        <a href="mailto:support@socialhub.xueer.space" className="text-blue-400 hover:text-blue-300">support@socialhub.xueer.space</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
