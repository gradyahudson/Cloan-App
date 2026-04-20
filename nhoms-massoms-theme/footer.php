<?php
// Elementor canvas template suppresses footer
$page_template = get_post_meta( get_the_ID(), '_wp_page_template', true );
if ( in_array( $page_template, [ 'elementor_canvas', 'template-landing.php' ], true ) ) {
	echo '</div>'; // close #site-main
	wp_footer();
	echo '</body></html>';
	return;
}
?>

</div><!-- #site-main -->

<footer class="site-footer" role="contentinfo">
	<div class="site-footer__grid">

		<div class="site-footer__brand">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<span style="font-size:1.2rem;font-weight:700;color:#fff;">
					<?php bloginfo( 'name' ); ?>
				</span>
			<?php endif; ?>
			<p style="margin-top:12px;font-size:.85rem;max-width:240px;">
				<?php bloginfo( 'description' ); ?>
			</p>
		</div>

		<div class="site-footer__links">
			<?php if ( is_active_sidebar( 'footer-1' ) ) : ?>
				<?php dynamic_sidebar( 'footer-1' ); ?>
			<?php else : ?>
				<h4><?php esc_html_e( 'Quick Links', 'nhoms-massoms' ); ?></h4>
				<?php
				wp_nav_menu( [
					'theme_location' => 'footer',
					'menu_class'     => 'footer-menu',
					'container'      => false,
					'depth'          => 1,
					'fallback_cb'    => false,
				] );
				?>
			<?php endif; ?>
		</div>

		<div class="site-footer__contact">
			<?php if ( is_active_sidebar( 'footer-2' ) ) : ?>
				<?php dynamic_sidebar( 'footer-2' ); ?>
			<?php else : ?>
				<h4><?php esc_html_e( 'Contact', 'nhoms-massoms' ); ?></h4>
				<p style="font-size:.9rem;">
					<?php esc_html_e( 'Update contact details in Appearance → Widgets → Footer Column 2.', 'nhoms-massoms' ); ?>
				</p>
			<?php endif; ?>
		</div>

	</div>

	<div class="site-footer__bottom">
		<span>
			&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?>
			<?php bloginfo( 'name' ); ?>.
			<?php esc_html_e( 'All rights reserved.', 'nhoms-massoms' ); ?>
		</span>
		<span>
			<?php
			printf(
				/* translators: %s: WordPress link */
				esc_html__( 'Powered by %s', 'nhoms-massoms' ),
				'<a href="https://wordpress.org" style="color:inherit;">WordPress</a>'
			);
			?>
		</span>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
