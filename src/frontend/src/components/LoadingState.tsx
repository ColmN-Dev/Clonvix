import { LoaderCircle } from 'lucide-react';

function LoadingState() {
    return (
        <div className="loading-overlay">
            <LoaderCircle className="loading-spinner" size={48} />
        </div>
    );
}

export default LoadingState;