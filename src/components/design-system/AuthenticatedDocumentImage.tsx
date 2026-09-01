import React, { useEffect, useState } from "react";

interface AuthenticatedDocumentImageProps {
    url: string;
    alt: string;
    className?: string;
}

export const AuthenticatedDocumentImage: React.FC<
    AuthenticatedDocumentImageProps
> = ({ url, alt, className }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;
        let cancelled = false;

        const loadImage = async () => {
            try {
                setLoading(true);
                setError(false);

                const token = localStorage.getItem("auth_token");

                const response = await fetch(url, {
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : {},
                });

                if (!response.ok) {
                    throw new Error(
                        `Erro ao carregar imagem: ${response.status}`
                    );
                }

                const blob = await response.blob();

                if (cancelled) return;

                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            } catch (error) {
                console.error("Erro ao carregar imagem:", error);

                if (!cancelled) {
                    setError(true);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            cancelled = true;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [url]);

    if (loading) {
        return (
            <div
                className={`flex items-center justify-center bg-slate-100 ${className ?? ""}`}
            >
                <span className="text-xs text-slate-400">
                    Carregando...
                </span>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div
                className={`flex items-center justify-center bg-slate-100 ${className ?? ""}`}
            >
                <span className="text-xs text-rose-400">
                    Não foi possível carregar a imagem
                </span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
        />
    );
};