<?php get_header(); ?>

<div class="error-404">
	<h1>404</h1>
	<h2><?php esc_html_e( 'Page Not Found', 'nhoms-massoms' ); ?></h2>
	<p><?php esc_html_e( 'The page you are looking for may have been moved, deleted, or never existed.', 'nhoms-massoms' ); ?></p>
	<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn">
		<?php esc_html_e( '← Back to Home', 'nhoms-massoms' ); ?>
	</a>
</div>

<?php get_footer(); ?>
