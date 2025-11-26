import { View, StyleSheet } from 'react-native';


// Star component for the night sky effect
export const Stars = () => {
    const stars = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 60,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
    }));

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {stars.map((star) => (
                <View
                    key={star.id}
                    style={{
                        position: 'absolute',
                        left: `${star.left}%`,
                        top: `${star.top}%`,
                        width: star.size,
                        height: star.size,
                        borderRadius: star.size / 2,
                        backgroundColor: '#fff',
                        opacity: star.opacity,
                    }}
                />
            ))}
        </View>
    );
};