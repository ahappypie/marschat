package io.github.ahappypie.marschat.vsop87;
/**
 * Adapted from libnova - https://sourceforge.net/projects/libnova/
 * Commit hash 655bcd
 * Last Updated 2019-09-26
 * Files are organized as a workaround for the JVM's 64KB method limit
 * Some datasets can fit all in one file, some datasets must be separated out into private objects
 * However, the public interface remains the same:
 * $PLANET.${lat | long | rad}.$DATASET
 * Every dataset is an array of tuples, namely, Array[(Double, Double, Double)]
 */