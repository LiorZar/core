use GL

; -- sin
with ix as 
(
	select (SIN(2*PI()*(i-1.0)/255.0) + 1.0)*0.5 v from idx where i <= 256
)
, iy as 
(
	select v, cast(v*255 + 0.5 as int) i, cast(cast(v*255 + 0.5 as int) as binary(1)) b from ix
)
--select * from iy
select convert(varchar(2), b, 2) from iy for xml path('')


; -- cos
with ix as 
(
	select (COS(2*PI()*(i-1.0)/255.0) + 1.0)*0.5 v from idx where i <= 256
)
, iy as 
(
	select v, cast(v*255 + 0.5 as int) i, cast(cast(v*255 + 0.5 as int) as binary(1)) b from ix
)
--select * from iy
select convert(varchar(2), b, 2) from iy for xml path('')

; --step
with ix as 
(
	select IIF(i < 128, 0, 1) v from idx where i <= 256
)
, iy as 
(
	select v, cast(v*255 + 0.5 as int) i, cast(cast(v*255 + 0.5 as int) as binary(1)) b from ix
)
--select * from iy
select convert(varchar(2), b, 2) from iy for xml path('')




