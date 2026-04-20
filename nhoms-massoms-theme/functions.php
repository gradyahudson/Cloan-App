<?php
defined( 'ABSPATH' ) || exit;

/* ------------------------------------------------------------------
   Theme setup
   ------------------------------------------------------------------ */
function nhoms_setup() {
	load_theme_textdomain( 'nhoms-massoms', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', [
		'height'      => 96,
		'width'       => 300,
		'flex-height' => true,
		'flex-width'  => true,
	] );
	add_theme_support( 'html5', [
		'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'script', 'style',
	] );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'align-wide' );

	register_nav_menus( [
		'primary' => __( 'Primary Navigation', 'nhoms-massoms' ),
		'footer'  => __( 'Footer Navigation', 'nhoms-massoms' ),
	] );
}
add_action( 'after_setup_theme', 'nhoms_setup' );

/* ------------------------------------------------------------------
   Elementor compatibility
   ------------------------------------------------------------------ */
function nhoms_elementor_support() {
	add_post_type_support( 'page', 'elementor' );
	add_post_type_support( 'post', 'elementor' );
}
add_action( 'init', 'nhoms_elementor_support' );

// Allow Elementor full-width / canvas page templates to suppress header/footer
function nhoms_elementor_page_template_body_class( $classes ) {
	if ( function_exists( '\Elementor\Plugin' ) ) {
		$page_template = get_post_meta( get_the_ID(), '_wp_page_template', true );
		if ( 'elementor_canvas' === $page_template || 'elementor_header_footer' === $page_template ) {
			$classes[] = 'elementor-template-' . $page_template;
		}
	}
	return $classes;
}
add_filter( 'body_class', 'nhoms_elementor_page_template_body_class' );

/* ------------------------------------------------------------------
   Enqueue styles & scripts
   ------------------------------------------------------------------ */
function nhoms_assets() {
	$ver = wp_get_theme()->get( 'Version' );

	wp_enqueue_style(
		'nhoms-main',
		get_template_directory_uri() . '/assets/css/main.css',
		[],
		$ver
	);

	wp_enqueue_style(
		'nhoms-responsive',
		get_template_directory_uri() . '/assets/css/responsive.css',
		[ 'nhoms-main' ],
		$ver
	);

	// Google Fonts — swap to match HubSpot brand fonts if needed
	wp_enqueue_style(
		'nhoms-fonts',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
		[],
		null
	);

	wp_enqueue_script(
		'nhoms-main',
		get_template_directory_uri() . '/assets/js/main.js',
		[],
		$ver,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'nhoms_assets' );

/* ------------------------------------------------------------------
   Widget areas
   ------------------------------------------------------------------ */
function nhoms_widgets_init() {
	register_sidebar( [
		'name'          => __( 'Sidebar', 'nhoms-massoms' ),
		'id'            => 'sidebar-1',
		'before_widget' => '<section id="%1$s" class="widget %2$s">',
		'after_widget'  => '</section>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	] );

	register_sidebar( [
		'name'          => __( 'Footer Column 1', 'nhoms-massoms' ),
		'id'            => 'footer-1',
		'before_widget' => '<div class="widget %2$s">',
		'after_widget'  => '</div>',
		'before_title'  => '<h4>',
		'after_title'   => '</h4>',
	] );

	register_sidebar( [
		'name'          => __( 'Footer Column 2', 'nhoms-massoms' ),
		'id'            => 'footer-2',
		'before_widget' => '<div class="widget %2$s">',
		'after_widget'  => '</div>',
		'before_title'  => '<h4>',
		'after_title'   => '</h4>',
	] );
}
add_action( 'widgets_init', 'nhoms_widgets_init' );

/* ------------------------------------------------------------------
   Excerpt length
   ------------------------------------------------------------------ */
function nhoms_excerpt_length( $length ) {
	return 25;
}
add_filter( 'excerpt_length', 'nhoms_excerpt_length' );

/* ------------------------------------------------------------------
   Custom page templates list (registered via PHP, not file)
   ------------------------------------------------------------------ */
function nhoms_add_page_templates( $templates ) {
	$templates['template-full-width.php'] = __( 'Full Width (no sidebar)', 'nhoms-massoms' );
	$templates['template-landing.php']    = __( 'Landing Page (no header/footer)', 'nhoms-massoms' );
	return $templates;
}
add_filter( 'theme_page_templates', 'nhoms_add_page_templates' );
