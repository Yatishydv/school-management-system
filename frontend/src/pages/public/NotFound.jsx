import React from "react";
import { Link } from "react-router-dom";
import { MoveLeft, Ghost, Home, Compass } from "lucide-react";
import Button from "../../components/ui/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden bg-white">
      {/* Background Accents - Shrinked */}
      <div className="absolute top-1/3 left-1/2 -translate-x-full w-[300px] h-[300px] bg-accent-100/30 rounded-full blur-[80px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/2 translate-x-full w-[300px] h-[300px] bg-primary-100/20 rounded-full blur-[80px] -z-10 animate-pulse delay-700"></div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-fade-up">
        {/* Error Code - Smaller/Cooler */}
        <div className="relative inline-block group">
          <h1 className="text-[10rem] md:text-[12rem] font-black text-primary-950/5 leading-none tracking-tighter select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Ghost size={80} className="text-accent-500 animate-bounce transition-transform group-hover:scale-110 duration-500" />
          </div>
        </div>

        {/* Message - Compact */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-primary-950 tracking-tighter italic leading-tight">
            Node <span className="text-accent-500">Unreachable.</span>
          </h2>
          <p className="text-sm md:text-base text-gray-400 max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-tight">
            This identity path does not exist. Our registry has zero record of this location.
          </p>
        </div>

        {/* Actions - Sleeker */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/">
            <Button variant="primary" className="px-8 py-4 rounded-xl flex items-center gap-2 group shadow-xl">
              <Home size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Return Home</span>
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="px-8 py-4 rounded-xl flex items-center gap-2 border-2 border-primary-950 hover:bg-primary-950 hover:text-white transition-all">
              <Compass size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
            </Button>
          </Link>
        </div>

        {/* Operational Metalabel */}
        <div className="pt-10 flex items-center justify-center gap-6 text-[8px] font-black uppercase tracking-[0.5em] text-gray-200">
           <span>Error_404</span>
           <div className="w-1 h-1 rounded-full bg-gray-200"></div>
           <span>Identity_Mismatch</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
