import React from 'react';
import Button from './Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                                Something went wrong
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                We apologize for the inconvenience. An unexpected error has occurred.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-md overflow-auto max-h-48 text-xs font-mono text-red-800 dark:text-red-200">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <div className="flex justify-center space-x-4">
                            <Button onClick={() => window.location.reload()}>
                                Refresh Page
                            </Button>
                            <Button variant="outline" onClick={this.handleReset}>
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
