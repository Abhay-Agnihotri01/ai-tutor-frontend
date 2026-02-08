import React from 'react';

const SuspenseLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center theme-bg-primary">
            <div className="text-center">
                {/* Logo Animation */}
                <div className="mb-8 animate-pulse">
                    <div className="w-20 h-20 theme-logo rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <span className="text-white font-bold text-3xl">L</span>
                    </div>
                    <h1 className="text-3xl font-bold theme-text-primary animate-fade-in">LearnHub</h1>
                </div>

                {/* Spinner/Indicator */}
                <div className="flex justify-center space-x-2 animate-pulse">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default SuspenseLoader;
