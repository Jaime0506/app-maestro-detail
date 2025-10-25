import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ToastProps {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    onHide: () => void;
    duration?: number;
}

export default function Toast({ visible, message, type, onHide, duration = 3000 }: ToastProps) {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Mostrar toast
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-hide después del duration
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            hideToast();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    };

    const getIconName = () => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'close-circle';
            case 'info':
                return 'information-circle';
            default:
                return 'checkmark-circle';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return '#34C759';
            case 'error':
                return '#FF3B30';
            case 'info':
                return '#007AFF';
            default:
                return '#34C759';
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#F0F9F4';
            case 'error':
                return '#FFF5F5';
            case 'info':
                return '#F0F7FF';
            default:
                return '#F0F9F4';
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return '#34C759';
            case 'error':
                return '#FF3B30';
            case 'info':
                return '#007AFF';
            default:
                return '#34C759';
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                },
            ]}
        >
            <View style={styles.content}>
                <Ionicons
                    name={getIconName()}
                    size={20}
                    color={getIconColor()}
                    style={styles.icon}
                />
                <Text style={[styles.message, { color: getIconColor() }]}>
                    {message}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});
