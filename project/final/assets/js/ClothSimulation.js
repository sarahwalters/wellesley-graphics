/*
 * Cloth Simulation using a relaxed constraints solver
 * Adapted from https://github.com/mrdoob/three.js/blob/master/examples/js/Cloth.js
 * (the original simulation is hard-coded and has a large footprint; I refactored the
 * code into a single function which takes user parameters)
 */

var ClothSimulation = (function(pins, windForceFunction, constraintFunction) {
    var DAMPING = 0.03;
    var DRAG = 1 - DAMPING;
    var MASS = 0.1;
    var restDistance = 25;

    var xSegs = 10;
    var ySegs = 10;

    var clothFunction = plane( restDistance * xSegs, restDistance * ySegs );

    var cloth = new Cloth( xSegs, ySegs );

    var GRAVITY = 981 * 1.4;
    var gravity = new THREE.Vector3( 0, - GRAVITY, 0 ).multiplyScalar( MASS );

    var TIMESTEP = 18 / 1000;
    var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

    var wind = true;
    var windForce = windForceFunction(0);

    var tmpForce = new THREE.Vector3();

    var lastTime;

    function plane( width, height ) {
        return function( u, v ) {
            var x = ( u - 0.5 ) * width;
            var y = ( v + 0.5 ) * height;
            var z = 0;

            return new THREE.Vector3( x, y, z );
        };
    }

    function Particle( x, y, z, mass ) {
        this.position = clothFunction( x, y ); // position
        this.previous = clothFunction( x, y ); // previous
        this.original = clothFunction( x, y );
        this.a = new THREE.Vector3( 0, 0, 0 ); // acceleration
        this.mass = mass;
        this.invMass = 1 / mass;
        this.tmp = new THREE.Vector3();
        this.tmp2 = new THREE.Vector3();
    }

    // Force -> Acceleration
    Particle.prototype.addForce = function( force ) {
        this.a.add(
            this.tmp2.copy( force ).multiplyScalar( this.invMass )
        );
    };

    // Performs Verlet integration
    Particle.prototype.integrate = function( timesq ) {
        var newPos = this.tmp.subVectors( this.position, this.previous );
        newPos.multiplyScalar( DRAG ).add( this.position );
        newPos.add( this.a.multiplyScalar( timesq ) );

        this.tmp = this.previous;
        this.previous = this.position;
        this.position = newPos;

        this.a.set( 0, 0, 0 );
    };

    var diff = new THREE.Vector3();

    function satisifyConstraints( p1, p2, distance ) {
        diff.subVectors( p2.position, p1.position );
        var currentDist = diff.length();
        if ( currentDist === 0 ) return; // prevents division by 0
        var correction = diff.multiplyScalar( 1 - distance / currentDist );
        var correctionHalf = correction.multiplyScalar( 0.5 );
        p1.position.add( correctionHalf );
        p2.position.sub( correctionHalf );
    }

    function Cloth( w, h ) {
        w = w || 10;
        h = h || 10;
        this.w = w;
        this.h = h;

        var particles = [];
        var constraints = [];

        var u, v;

        // Create particles
        for ( v = 0; v <= h; v ++ ) {
            for ( u = 0; u <= w; u ++ ) {
                particles.push(
                    new Particle( u / w, v / h, 0, MASS )
                );
            }
        }

        // Structural
        for ( v = 0; v < h; v ++ ) {
            for ( u = 0; u < w; u ++ ) {
                constraints.push( [
                    particles[ index( u, v ) ],
                    particles[ index( u, v + 1 ) ],
                    restDistance
                ] );

                constraints.push( [
                    particles[ index( u, v ) ],
                    particles[ index( u + 1, v ) ],
                    restDistance
                ] );
            }
        }

        for ( u = w, v = 0; v < h; v ++ ) {
            constraints.push( [
                particles[ index( u, v ) ],
                particles[ index( u, v + 1 ) ],
                restDistance
            ] );
        }

        for ( v = h, u = 0; u < w; u ++ ) {
            constraints.push( [
                particles[ index( u, v ) ],
                particles[ index( u + 1, v ) ],
                restDistance
            ] );
        }

        this.particles = particles;
        this.constraints = constraints;

        function index( u, v ) {
            return u + v * ( w + 1 );
        }

        this.index = index;
    }

    function simulate( time, clothGeometry ) {
        windForce = windForceFunction(time);

        if ( ! lastTime ) {
            lastTime = time;
            return;
        }

        var i, il, particles, particle, pt, constraints, constraint;

        // Aerodynamics forces
        if ( wind ) {
            var face, faces = clothGeometry.faces, normal;
            particles = cloth.particles;

            for ( i = 0, il = faces.length; i < il; i ++ ) {
                face = faces[ i ];
                normal = face.normal;

                tmpForce.copy( normal ).normalize().multiplyScalar( normal.dot( windForce ) );
                particles[ face.a ].addForce( tmpForce );
                particles[ face.b ].addForce( tmpForce );
                particles[ face.c ].addForce( tmpForce );
            }
        }

        for ( particles = cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {
            particle = particles[ i ];
            particle.addForce( gravity );

            particle.integrate( TIMESTEP_SQ );
        }

        // Start Constraints
        constraints = cloth.constraints;
        il = constraints.length;
        for ( i = 0; i < il; i ++ ) {
            constraint = constraints[ i ];
            satisifyConstraints( constraint[ 0 ], constraint[ 1 ], constraint[ 2 ] );
        }

        // Pin Constraints
        for ( i = 0, il = pins.length; i < il; i ++ ) {
            var xy = pins[ i ];
            var p = particles[ xy ];
            p.position.copy( p.original );
            p.previous.copy( p.original );
        }

        // User-defined Constraint
        for ( particles = cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {
            constraintFunction(particles[i]);
        }
    }

    function toggleWind() {
        wind = !wind;
    }

    return {
        clothFunction: clothFunction,
        w: cloth.w,
        h: cloth.h,
        particles: cloth.particles,
        simulate: simulate,
        toggleWind: toggleWind
    };
});
