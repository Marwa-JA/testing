export const AuthCard = ({ title, children, width = 'lg:w-4' }) => {
  return (
    <div className="flex align-items-center justify-content-center py-8 px-4">
      <div className={`glass p-4 w-full ${width}`}>
        <div className="text-center mb-5">
          <div className="text-3xl font-medium mb-3 gradient-text">{title}</div>
        </div>
        {children}
      </div>
    </div>
  );
};