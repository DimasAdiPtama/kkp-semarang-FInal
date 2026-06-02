export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="relative w-full min-h-screen flex flex-col justify-center items-center p-4 font-sans overflow-hidden bg-slate-900">
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/videos/background.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-linear-to-b from-blue-900/60 via-slate-900/80 to-blue-900/80"></div>
            </div>
            <div className="w-full max-w-105 z-10">
                <div className="flex flex-col items-center mb-8 text-white">
                    <div className=" drop-shadow-xl">
                        <img
                            src="/logo.png"
                            alt="Logo KKP"
                            className="h-24 w-auto object-contain"
                        />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Kementerian Kelautan dan Perikanan
                        </h1>
                        <p className="text-[10px] text-blue-200/80 mt-1 font-semibold tracking-[0.2em] uppercase">
                            Satuan Kerja Semarang
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20">
                    <div className="p-4">{children}</div>
                    <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                &copy; {new Date().getFullYear()}
                            </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">
                            KKP Semarang
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
}
