<?php

function medium_assets() {
    wp_enqueue_style( 'medium-css', get_template_directory_uri() . '/dist/css/main.css', array(), '1.0.0', 'all' );
    wp_enqueue_script( 'medium-js', get_template_directory_uri() . '/dist/js/main.js', array(), '1.0.0', true );
}
add_action('wp_enqueue_scripts', 'medium_assets');