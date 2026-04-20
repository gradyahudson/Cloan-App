<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>

<body <?php body_class( 'site-wrapper' ); ?>>
<?php wp_body_open(); ?>

<?php
// Elementor canvas template suppresses this header entirely
$page_template = get_post_meta( get_the_ID(), '_wp_page_template', true );
if ( in_array( $page_template, [ 'elementor_canvas', 'template-landing.php' ], true ) ) {
	return;
}
?>

<header class="site-header" role="banner">
	<div class="site-header__inner">

		<div class="site-logo">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
					<span style="font-family:var(--font-heading);font-size:1.4rem;font-weight:700;color:var(--color-primary);">
						<?php bloginfo( 'name' ); ?>
					</span>
				</a>
			<?php endif; ?>
		</div>

		<nav class="primary-nav" role="navigation" aria-label="<?php esc_attr_e( 'Primary Menu', 'nhoms-massoms' ); ?>">
			<?php
			wp_nav_menu( [
				'theme_location' => 'primary',
				'menu_class'     => 'primary-menu',
				'container'      => false,
				'fallback_cb'    => function() {
					echo '<ul><li><a href="' . esc_url( admin_url( 'nav-menus.php' ) ) . '">' .
						esc_html__( 'Add a menu', 'nhoms-massoms' ) . '</a></li></ul>';
				},
			] );
			?>
		</nav>

		<button class="nav-toggle" aria-label="<?php esc_attr_e( 'Toggle menu', 'nhoms-massoms' ); ?>" aria-expanded="false">
			<span></span>
			<span></span>
			<span></span>
		</button>

	</div>
</header>

<div id="site-main" class="site-main">
