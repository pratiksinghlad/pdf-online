import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

/**
 * A centralized Motion-ready Chakra Box component.
 * 
 * Using a shared component prevents 'Cannot access before initialization' errors
 * in production builds that can occur when calling motion.create(Box) at the 
 * top level of multiple entry points sharing the same vendor chunk.
 */
export const MotionBox = motion.create(Box);
