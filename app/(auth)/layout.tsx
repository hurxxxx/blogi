const AuthLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-50 py-8 px-4">
            {children}
        </div>
    );
}

export default AuthLayout;
