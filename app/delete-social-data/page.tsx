export default function DeleteSocialData() {
    return (
        <div className="max-w-4xl mx-auto p-6 pb-32 min-h-screen">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Data Deletion Instructions</h1>
                <p className="text-white/50">For Facebook and other Social Platform Users</p>
            </header>

            <div className="space-y-8 text-white/80 leading-relaxed">
                <section>
                    <p>
                        SocialHub connects with various social media platforms (like Facebook, LinkedIn, TikTok) to help you manage your accounts.
                        In compliance with the policies of these platforms, we provide this page to explain how you can request the deletion of your data from our system.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">How to Remove Your Data</h2>
                    <p className="mb-4">
                        If you wish to remove your data from SocialHub, you can remove your account directly within the application, or you can follow these steps to revoke access via the social platform itself.
                    </p>

                    <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                        <h3 className="text-lg font-medium text-white mb-2">Automated Data Deletion Request</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Log into your SocialHub account.</li>
                            <li>Go to <strong>Settings</strong> {'>'} <strong>Account</strong>.</li>
                            <li>Click on <strong>Delete Account</strong>. This will remove all your data from our database, including linked social accounts and scheduled posts.</li>
                        </ol>
                    </div>

                    <div className="bg-white/5 p-6 rounded-lg border border-white/10 mt-6">
                        <h3 className="text-lg font-medium text-white mb-2">Manual Deletion / Revoking Access (Facebook Example)</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Go to your Facebook Account's <strong>Settings & Privacy</strong>.</li>
                            <li>Click <strong>Settings</strong>.</li>
                            <li>Scroll down to look for <strong>Apps and Websites</strong>.</li>
                            <li>Find <strong>SocialHub</strong> in the list.</li>
                            <li>Click <strong>Remove</strong>. This will revoke our access to your data.</li>
                            <li>Additionally, you can click "View and Edit" to see what data is being shared.</li>
                        </ol>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-white">Contact for Assistance</h2>
                    <p>
                        If you are unable to delete your data using the methods above, or if you want to confirm that your data has been deleted, please contact our privacy team at: <br />
                        <a href="mailto:privacy@socialhub.xueer.space" className="text-blue-400 hover:text-blue-300">privacy@socialhub.xueer.space</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
